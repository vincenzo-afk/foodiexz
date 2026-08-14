"use client"
import { InfoPage } from "../../InfoPage"
import { Link } from "react-router-dom"

const sections = [
  {
    title: "1. Acceptance of terms",
    body: "By accessing or using FoodiezX, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the service. These terms may be updated from time to time, and continued use constitutes acceptance of the revised terms.",
  },
  {
    title: "2. Description of services",
    body: "FoodiezX operates an online marketplace connecting customers with independent restaurants, and provides or arranges food delivery services through its rider network. We do not prepare food; all food is prepared by and purchased from the restaurants listed on the platform.",
  },
  {
    title: "3. User accounts",
    body: "You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You agree to provide accurate registration information and to update it as needed.",
  },
  {
    title: "4. Orders and payments",
    body: "All orders are subject to restaurant availability and delivery-zone confirmation. Prices include applicable taxes. Payment is processed through PCI-DSS compliant third-party gateways. Orders may be declined or cancelled in the event of payment failure, stock unavailability, or suspected fraud.",
  },
  {
    title: "5. User content",
    body: "Reviews, ratings and other content you submit remain yours, but you grant FoodiezX a license to display them on the platform. You agree not to submit content that is false, defamatory, abusive or infringing. We may remove content that violates these terms.",
  },
  {
    title: "6. Limitation of liability",
    body: "FoodiezX acts as an intermediary between customers, restaurants and delivery riders. To the maximum extent permitted by law, FoodiezX shall not be liable for indirect, incidental or consequential damages arising from the use of the service. Food quality concerns should be raised with the restaurant and our support team.",
  },
  {
    title: "7. Changes to terms",
    body: "We may revise these terms at any time. Material changes will be highlighted on this page or communicated via email or in-app notice at least 7 days before they take effect.",
  },
  {
    title: "8. Governing law",
    body: "These terms are governed by the laws of India. Any dispute arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts of New Delhi.",
  },
]

export function Terms() {
  return (
    <InfoPage
      title="Terms of Service"
      subtitle="Last updated: August 14, 2026"
    >
      <p>
        Welcome to FoodiezX. This document governs your use of our website and mobile services
        ("Service"). Please read it carefully — it forms a legally binding agreement between you and
        FoodiezX Private Limited ("we", "us", "our").
      </p>
      {sections.map((s) => (
        <div key={s.title}>
          <h2>{s.title}</h2>
          <p>{s.body}</p>
        </div>
      ))}
      <p>
        For questions about these terms, contact us via the{" "}
        <Link to="/contact">contact page</Link> or write to legal@foodiezx.com.
      </p>
    </InfoPage>
  )
}
