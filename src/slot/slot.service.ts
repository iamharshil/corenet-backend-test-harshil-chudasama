import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { PrismaService } from '../prisma/prisma.service.js';

dayjs.extend(utc);

type Slot = { start: dayjs.Dayjs; end: dayjs.Dayjs };

@Injectable()
export class SlotService {
  constructor(private readonly prisma: PrismaService) {}

  async getSlots(businessId: number, serviceId: number, date: string) {
    const today = dayjs.utc().format('YYYY-MM-DD');
    const parsedDate = dayjs.utc(date);
    if (!parsedDate.isValid() || parsedDate.format('YYYY-MM-DD') !== date) {
      throw new BadRequestException('date is not a real date');
    }
    if (date < today) {
      throw new BadRequestException('date is in the past');
    }
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, businessId, status: 'ACTIVE' },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    const jsDay = dayjs.utc(date).day();
    const day = jsDay === 0 ? 6 : jsDay - 1;
    const windows = await this.prisma.weeklyAvailability.findMany({
      where: { businessId, day },
      orderBy: { startsAt: 'asc' },
    });
    const slots: Slot[] = [];
    for (const window of windows) {
      const windowEnd = dayjs.utc(`${date} ${window.endsAt}`);
      let start = dayjs.utc(`${date} ${window.startsAt}`);
      while (true) {
        const end = start.add(service.duration, 'minute');
        if (end.isAfter(windowEnd)) {
          break;
        }
        slots.push({ start, end });
        start = end;
      }
    }
    const bookings = await this.prisma.booking.findMany({
      where: {
        businessId,
        status: { not: 'CANCELLED' },
        startsAt: {
          gte: dayjs.utc(date).startOf('day').toDate(),
          lt: dayjs.utc(date).endOf('day').toDate(),
        },
      },
    });
    let free = slots.filter((slot) => {
      const clash = bookings.some(
        (booking) =>
          slot.start.isBefore(booking.endsAt) &&
          slot.end.isAfter(booking.startsAt),
      );
      return !clash;
    });
    if (date === today) {
      const now = dayjs.utc();
      free = free.filter((slot) => slot.start.isAfter(now));
    }
    return free.map((slot) => ({
      startsAt: slot.start.toISOString(),
      endsAt: slot.end.toISOString(),
    }));
  }
}
