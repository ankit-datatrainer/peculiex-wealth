"use strict";
const { z } = require("zod");
module.exports = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(6).max(40),
  interest: z.string().min(1).max(80),
  budget: z.string().min(1).max(80),
  message: z.string().max(2000).optional().nullable(),
});
