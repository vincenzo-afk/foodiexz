"use client"
import { InfoPage } from "../../InfoPage"
import { Link } from "react-router-dom"

const sections = [
  {
    title: "1. What we collect",
    body: "We collect information you provide directly — name, email address, phone number, delivery addresses and payment method details. We also collect technical data automatically: device type, browser, IP address, approximate location and usage statistics, to keep the service secure and improve it.",
  },
  {
    title: "2. How we use your data",
    body: "Your data is used to process and deliver orders, communicate order updates, apply offers and coupons, personalize restaurant recommendations, prevent fraud, and comply with legal obligations. We never sell your personal information to third parties.",
  },
  {
    title: "3. Cookies",
    body: "We use essential cookies to keep you signed in and remember your cart, preference cookies to remember settings, and analytics cookies to understand how the site is used. See our Cookie Policy for details and management options.",
  },
  {
    title: "4. Sharing of information",
    body: "We share only what is necessary: delivery address and contact number with your rider, order details with the restaurant preparing your food, and payment details with our PCI-DSS compliant payment gateway. Aggregated, anonymized data may be shared with partners.",
  },
  {
    title: "5. Data retention",
    body: "Personal data is retained for as long as your account is active or as needed to provide services, settle disputes and comply with legal obligations. You can request deletion of your account at any time.",
  },
  {
    title: "6. Your rights",
    body: "You may access, correct or delete your personal data, withdraw consent, and opt out of marketing communications at any time from your account settings or by contacting us. Requests are actioned within 30 days.",
  },
  {
    title: "7. Security",
    body: "We use industry-standard encryption (TLS) in transit, store passwords as bcrypt hashes, and review access controls regularly. No method of transmission over the internet is 100% secure, but we work hard to protect you.",
  },
  {
    title: "8. Contact",
    body: "For privacy questions or data requests, email privacy@foodiezx.com or reach us via the contact page.",
  },
]

export function Privacy() {
  return (
    <InfoPage
      title="Privacy Policy"
      subtitle="Last updated: August 14, 2026"
    >
      <p>
        FoodiezX Private Limited ("we", "us", "our") respects your privacy. This policy explains
        what personal information we collect, why we collect it and how you can control it.
      </p>
      {sections.map((s) => (
        <div key={s.title}>
          <h2>{s.title}</h2>
          <p>{s.body}</p>
        </div>
      ))}
      <p>
        See also our <Link to="/terms">Terms of Service</Link> and{" "}
        <Link to="/cookie">Cookie Policy</Link>.
      </p>
    </InfoPage>
  )
}
