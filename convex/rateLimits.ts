import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Contact form: max 5 submissions per hour per email
  contactForm: {
    kind: "token bucket",
    rate: 5,
    period: HOUR,
    capacity: 5,
  },
  // Login attempts: max 10 per 15 minutes
  login: {
    kind: "token bucket",
    rate: 10,
    period: 15 * MINUTE,
    capacity: 10,
  },
  // Magic link requests: max 3 per hour
  magicLink: {
    kind: "token bucket",
    rate: 3,
    period: HOUR,
    capacity: 3,
  },
});
