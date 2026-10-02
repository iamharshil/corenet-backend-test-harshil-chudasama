# Design

- [NOTE]: I have used AI for some extent for nest.js code and structure because I am new to nest.js and I have used it only once before. so I have used AI to understand the structure and code of nest.js and some code generation.

## DB Schema

// !remove Database schema - all tables/models, fields, types, and relationships. Explain why you structured
it this way

## Basic flow of tables

- Business table has relation with service it provides, availabilities and bookings.
- User has relation with booking.
- Token table/model is used for storing token for email verification.

## ORM and schema design

- I am using prism as ORM and it's schema is set in `./prisma/schema.prisma`.

### Separate Business and User table

- Because business and user requires separate auth flow I have created separate table for both. Also if business owner wants to use app as user itself they can do that too because separate tables.

### Business Services and it's Weekly Availability.

- I have created services and weeklyAvailability table which has relation to business table.
- So through business itself I can fetch both it's weekly availability and services it provides.

### Weekly Availability

- Since business can have temporary break time like launch or anything. so business can select each day and provide duration for it.
- Let's say business if open on monday from 9 to 1 and 2 to 6 and it's close between 1 pm to 2 pm, then business will have 2 separate weekly availability data. Both for monday but one will have start time of 09:00 and end time of 13:00 (24 hour format). and other with 14:00 and 18:00.
- I have used string instead of datetime for both start and end time here because first it removes date confusion and I can create slots for this in better way.

### Services Table

- For fetching service based booking and service details from booking I have created relation between them.
- service has relation which booking too, which can help fetch booking based on services.

### User Table

- User table has relation of their booking only, which can help fetch user's booking.

### Token Table

- This is for email verify of user and business.

## API Surface: list every endpoint you chose to build: method, path, who can call it, and what it

does.

### Business Endpoints

POST `/auth/business/register` - anyone - for registering business.
GET `/auth/business/verify?token=abc` - anyone - for business email verification.
POST `/auth/business/login` - anyone - for business side login.

### Business Owner Endpoints

GET `/business/me` - business owner - for getting own business profile.
PATCH `/business/me` - business owner - for updating own business name and mobile.
POST `/business/services` - business owner - for adding one new service.
GET `/business/services` - business owner - for getting all own services.
PATCH `/business/services/:id` - business owner - for updating own service, need to send all fields same as create.
DELETE `/business/services/:id` - business owner - for deleting own service, we only make it inactive.
POST `/business/availabilities` - business owner - for adding weekly open time window.
GET `/business/availabilities` - business owner - for getting own all weekly time windows.
DELETE `/business/availabilities/:id` - business owner - for removing own weekly time window.

### User Endpoints

POST `/auth/register` - anyone - for registering user.
GET `/auth/verify?token=abc` - anyone - for user email verification.
POST `/auth/login` - anyone - for user side login.

### Slot Endpoints

GET `/slots?businessId=1&serviceId=1&date=2026-10-05` - anyone - for getting all free slots of one service on one date.

## Auth Design: how you separate business owner and customer roles; what is protected and how.

- For auth I am using jwt token, there will be separate path for user and business auth.
- business path will have `/auth/business` prefix and user will have `/auth/user`.
- I am using verify endpoint and token table for email verification for both user and business through their separate route.

## Edge Cases: every conflict, invalid state, or business rule you identified, and how you handle

- Storing and handling availability might have edge case of timing.
- Storing and handling availability has edge case of timing because services cannot be hourly based only.
- Since business can have multiple services I have created separate model for it.
- business availability can be set like 09:00 to 13:00 and 14:00 to 18:00 for same day, so for finding unbooked slots first I have used dayjs module for getting day (i.e. 0, 1...), then I have fetched all availability slot for that day. I loop from each of them based on service availability if it fit before availability ends then I have created it as slot if not then it's skipped. same goes for all availability for that day.

## Assumptions: anything the brief left ambiguous and the decision you made.

- There can be possibility where business can have multiple staff for services where user can book based on staff and services availability but docs says booking for same slot can be done once.
