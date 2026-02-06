import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Mail } from "lucide-react";

const ComplaintsHandling = () => (
  <>
    <Helmet>
      <title>Complaints Handling Policy - RBP FINIVIS</title>
      <meta name="description" content="Complaints handling policy for RBP FINIVIS PRIVATE LIMITED. Learn how we handle and resolve customer complaints." />
    </Helmet>
    <Layout>
      <section className="gradient-hero py-16">
        <div className="container-custom text-center text-primary-foreground">
          <h1 className="text-4xl font-heading font-bold">Complaints Handling Policy</h1>
          <p className="text-primary-foreground/80 mt-2">How we handle and resolve customer complaints</p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container-custom max-w-3xl">
          <p className="text-muted-foreground mb-8">Effective: 20th December 2025</p>
          
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">1. Policy Objective</h2>
              <p className="text-muted-foreground">
                To ensure efficient and effective resolution of customer complaints, fostering trust and continuous improvement in service delivery.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">2. Scope</h2>
              <p className="text-muted-foreground">
                This policy covers all complaints regarding RBP FINIVIS PRIVATE LIMITED's fintech services.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">3. Complaints Management Structure</h2>
              <p className="text-muted-foreground">
                The Chief Operating Officer (COO) is the designated authority for overseeing the complaints handling process.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:compliance@rbpfinivis.com" className="text-primary hover:underline">
                  compliance@rbpfinivis.com
                </a>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">4. Principles for Handling Complaints</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-3 ml-4">
                <li>
                  <strong>Accessibility:</strong> The complaints process will be clear and easily accessible to all customers.
                </li>
                <li>
                  <strong>Responsiveness:</strong> Every complaint will be acknowledged promptly within 24 hours and handled in a timely manner, with the aim of resolving it within 14 working days.
                </li>
                <li>
                  <strong>Fairness and Impartiality:</strong> Complaints will be treated with impartiality and fairness at all stages.
                </li>
                <li>
                  <strong>Confidentiality:</strong> Personal information will be protected in accordance with privacy laws.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">5. Process for Making a Complaint</h2>
              <p className="text-muted-foreground">
                Customers may submit complaints via email, phone, or letter. All complaints must be logged and tracked through resolution.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">6. Investigation</h2>
              <p className="text-muted-foreground">
                Complaints will be investigated promptly, with initial findings reported to the complainant within 5 working days.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">7. Resolution and Feedback</h2>
              <p className="text-muted-foreground">
                Final resolutions communicated within 30 working days, with full rationale provided to the customer.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">8. Monitoring and Reporting</h2>
              <p className="text-muted-foreground">
                A monthly analysis of complaint trends to identify systemic improvements.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">9. Training</h2>
              <p className="text-muted-foreground">
                Annual training for staff on the updated complaints handling procedures.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">10. Continuous Improvement</h2>
              <p className="text-muted-foreground">
                Utilization of complaints data to enhance service quality continuously.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">11. Policy Review</h2>
              <p className="text-muted-foreground">
                Annual policy review or more frequently as required, ensuring alignment with regulatory changes and industry best practices.
              </p>
            </div>

            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Non-compliance with this policy may lead to disciplinary action.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  </>
);

export default ComplaintsHandling;
