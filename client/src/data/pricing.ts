import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
  {
    name: "Basic",
    price: 29,
    period: "month",
    features: [
      "50 Ai thumbnails per months",
      "Basic templates",
      "Standard resolution",
      "No Watermark",
      "Email Support",
    ],
    mostPopular: false,
  },
  {
    name: "Pro",
    price: 79,
    period: "month",
    features: [
      "Unlimited Ai thumbnails",
      "Premium templates",
      "4k Resolution",
      "A/B Testing",
      "Priority Support",
      "Custom Fonts",
      "Brand Kit Analysis",
    ],
    mostPopular: true,
  },
  {
    name: "Enterprise",
    price: 199,
    period: "month",
    features: [
      "Everything in Pro",
      "API Access",
      "Team Collaboration",
      "Custom Branding",
      "Dedicated Account Manager    ",
    ],
    mostPopular: false,
  },
];
