"use client"

import { Pencil } from "lucide-react"

export function Contact() {
  return (
    <div className="w-full  transition-colors duration-300">
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-row mb-8 justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              GUARD SERVICE AGREEMENT
            </h1>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl">
              This Guard Service Agreement is entered into between the Service
              Provider and the Service Recipient. Both parties hereby agree to
              the following terms and conditions:
            </p>
          </div>
          <Pencil className="h-6 w-6 text-blue-500 border border-blue-300 rounded-lg p-1 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400" />
        </div>

        {/* Contract Content */}
        <div className="space-y-8 text-gray-800 dark:text-gray-200">
          {/* Section Template */}
          <Section
            number="1"
            title="PURPOSE"
            content={`The Contractor agrees to provide professionally trained and qualified security personnel to safeguard the premises, property, and personnel in accordance with the provisions of this Agreement.`}
          />

          <Section
            number="2"
            title="SCOPE OF SERVICES"
            list={[
              "Deploy an appropriate number of licensed security guards based on operational and site-specific requirements.",
              "Ensure all guards are properly uniformed and equipped with the necessary standard security gear.",
              "Assign duties that may include, but are not limited to, access control, perimeter patrols, CCTV monitoring, incident reporting, and maintaining on-site logs.",
              "Provide suitable replacement personnel in the event of absenteeism, illness, or unavailability of any assigned guard.",
            ]}
            intro="The Contractor shall:"
          />

          <Section
            number="3"
            title="TERM"
            content={`This Agreement shall remain in effect until terminated by either party in accordance with the termination provisions contained herein.`}
          />

          <Section
            number="4"
            title="SERVICE HOURS"
            content={`The Contractor shall provide security services in accordance with a schedule mutually agreed upon by both parties. Any modification to service hours must be confirmed in writing.`}
          />

          <Section
            number="5"
            title="PAYMENT TERMS"
            list={[
              "The Client shall compensate the Contractor at a rate mutually agreed upon in writing.",
              "Payments shall be made at regular intervals as specified in the payment schedule.",
              "Any delayed or overtake payment may incur additional service or late fees as determined by the Contractor.",
            ]}
          />

          <Section
            number="6"
            title="EQUIPMENT & UNIFORMS"
            list={[
              "All standard uniforms and essential security equipment shall be supplied and maintained by the Contractor.",
              "Any specialized or additional equipment required beyond standard provisions shall be arranged subject to mutual consent.",
            ]}
          />

          <Section
            number="7"
            title="CLIENT RESPONSIBILITIES"
            intro="The Client agrees to:"
            list={[
              "Provide guards with reasonable access to designated areas and necessary facilities during duty hours.",
              "Promptly report any incidents, concerns, or operational issues to the Contractor for timely response and resolution.",
            ]}
          />

          <Section
            number="8"
            title="INSURANCE & LIABILITY"
            list={[
              "The Contractor shall maintain appropriate insurance coverage for its personnel, including liability and compensation as required by applicable law.",
              "The Contractor shall not be held liable for any loss, damage, or incident not directly resulting from the negligence, willful misconduct, or breach of duty by its personnel.",
            ]}
          />

          <Section
            number="9"
            title="CONFIDENTIALITY"
            content={`Both parties agree to maintain the confidentiality of all proprietary or sensitive information obtained during the course of this Agreement and to protect such information from unauthorized disclosure.`}
          />

          <Section
            number="10"
            title="TERMINATION"
            content={`Either party may terminate this Agreement by providing reasonable written notice. Immediate termination may occur in cases of breach of contract, professional misconduct, or non-payment for services rendered.`}
          />

          <Section
            number="11"
            title="GOVERNING LAW & DISPUTE RESOLUTION"
            content={`This Agreement shall be governed by and construed in accordance with the applicable laws of the jurisdiction in which services are performed. Any disputes arising hereunder shall first be addressed through amicable negotiation; failing which, the matter shall be referred to arbitration or other lawful dispute resolution mechanisms.`}
          />

          <Section
            number="12"
            title="ENTIRE AGREEMENT"
            content={`This Agreement constitutes the entire understanding between the Contractor and the Client and supersedes any prior agreements, representations, or understandings, whether written or oral. Any amendments or modifications must be executed in writing and duly signed by authorized representatives of both parties.`}
          />
        </div>
      </div>
    </div>
  )
}

/* Reusable Section Component */
function Section({
  number,
  title,
  content,
  list,
  intro,
}: {
  number: string
  title: string
  content?: string
  list?: string[]
  intro?: string
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {number}. {title}
      </h2>
      {intro && (
        <p className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
          {intro}
        </p>
      )}
      {content && (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {content}
        </p>
      )}
      {list && (
        <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
          {list.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
