import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";

const LegalDisclaimer = () => (
  <>
    <Helmet>
      <title>Legal Disclaimer - RBP FINIVIS</title>
      <meta name="description" content="Legal disclaimer for RBP FINIVIS PRIVATE LIMITED website and services." />
    </Helmet>
    <Layout>
      <section className="gradient-hero py-16">
        <div className="container-custom text-center text-primary-foreground">
          <h1 className="text-4xl font-heading font-bold">Legal Disclaimer</h1>
          <p className="text-primary-foreground/80 mt-2">Important legal information about our website</p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container-custom max-w-3xl">
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Copyright and Trademarks</h2>
              <p className="text-muted-foreground">
                RBP FINIVIS PRIVATE LIMITED retains copyright on all the text, contents, graphics and trademarks displayed on this site. All the text, graphics and trademarks displayed on this site are owned by RBP FINIVIS PRIVATE LIMITED.
              </p>
              <p className="text-muted-foreground mt-4">
                The information on this site has been included in good faith and is for general purpose only and should not be relied upon for any specific purpose. The user shall not distribute text or graphics to others without the express written consent of RBP FINIVIS PRIVATE LIMITED. The user shall also not, without RBP FINIVIS PRIVATE LIMITED's prior permission, copy and distribute this information on any other server, or modify or reuse text or graphics on this or any another system.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Accuracy of Information</h2>
              <p className="text-muted-foreground">
                Although RBP FINIVIS PRIVATE LIMITED tries to ensure that all information and recommendations, whether in relation to the products, services, offerings or otherwise (hereinafter "information"), provided as part of this website is correct at the time of inclusion on the web site, RBP FINIVIS PRIVATE LIMITED does not guarantee the accuracy of the Information. RBP FINIVIS PRIVATE LIMITED makes no representations or warranties as to the completeness or accuracy of Information.
              </p>
              <p className="text-muted-foreground mt-4">
                Certain links in this site connect to other Web Sites maintained by third parties over whom RBP FINIVIS PRIVATE LIMITED has no control. RBP FINIVIS PRIVATE LIMITED makes no representations as to the accuracy or any other aspect of information contained in such other Web Sites.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">
                RBP FINIVIS PRIVATE LIMITED hereby disclaims all warranties and conditions with regard to this information, including all implied warranties and conditions of merchantability, fitness for any particular purpose, title and non-infringement. In no event will RBP FINIVIS PRIVATE LIMITED, its related partnerships or corporations, or the partners, agents or employees thereof be liable for any decision made by the user and/or site visitor for any inference or action taken in reliance on the information provided in this site or for any consequential, special or similar damages.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Applicable Law and Jurisdiction</h2>
              <p className="text-muted-foreground">
                This Disclaimer is governed by and to be interpreted in accordance with laws of India, without regard to the choice or conflicts of law provisions of any jurisdiction. The user/site visitor agrees that in the event of any dispute arising in relation to this Disclaimer or any dispute arising in relation to the web site whether in contract or tort or otherwise, to submit to the jurisdiction of the courts located at Panchkula (Haryana) (India) only for the resolution of all such disputes.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Forward-Looking Statements</h2>
              <p className="text-muted-foreground">
                Except for the historical information herein, statements in this website, which includes words or phrases such as "will", "aim", "will likely result", "would", "believe", "may", "expect", "will continue", "anticipate", "estimate", "intend", "plan", "contemplate", "seek to", "future", "objective", "goal", "likely", "project", "should", "potential", "will pursue", and similar expressions or variations of such expressions may constitute "forward-looking statements".
              </p>
              <p className="text-muted-foreground mt-4">
                These forward-looking statements involve a number of risks, uncertainties and other factors that could cause actual results to differ materially from those suggested by the forward-looking statements. These risks and uncertainties include, but are not limited to our liability to successfully implement our strategy, our growth and expansion plans, obtain regulatory approvals, our provisioning policies, technological changes, investment and business income, cash flow projections, our exposure to the market risks as well as other risks.
              </p>
              <p className="text-muted-foreground mt-4">
                The company does not undertake any obligation to update forward-looking statements to reflect events or circumstances after the date thereof.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  </>
);

export default LegalDisclaimer;
