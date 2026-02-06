import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";

const Refund = () => (
  <>
    <Helmet>
      <title>Refund Policy - RBP FINIVIS</title>
      <meta name="description" content="Refund policy for RBP FINIVIS PRIVATE LIMITED. Learn about our refund and liability terms for transactions." />
    </Helmet>
    <Layout>
      <section className="gradient-hero py-16">
        <div className="container-custom text-center text-primary-foreground">
          <h1 className="text-4xl font-heading font-bold">Refund Policy</h1>
          <p className="text-primary-foreground/80 mt-2">Understanding our refund and liability terms</p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container-custom max-w-3xl">
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-xl font-semibold mb-4">RBP FINIVIS PRIVATE LIMITED's Liability for Refund</h2>
              <ol className="list-decimal list-inside text-muted-foreground space-y-4 ml-4">
                <li>
                  We will refund the amount in case a transaction is failed due to any reason directly caused by RBP FINIVIS PRIVATE LIMITED. Once RBP FINIVIS PRIVATE LIMITED receives a relevant confirmation from the payment gateway, a proper refund will be processed to the user's bank account and it will take 3-21 working days to reflect from the date of transaction. Confirmation about the same will be notified to the User's registered Email ID. Kindly note, a refund will be processed only for the transaction amount, and not for any payment gateway charges or applicable taxes.
                </li>
                <li>
                  We will refund the amount in case the user has paid for some services, got confirmation about the payment but does not receive those services to utilize. In such cases, we request the user to drop us a complaint on our official Email ID and let us evaluate the scenario. Once we investigate and make a conclusion, we will refund your amount to your bank account.
                </li>
              </ol>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-4">RBP FINIVIS PRIVATE LIMITED's Non-Liability for Refund</h2>
              <ol className="list-decimal list-inside text-muted-foreground space-y-4 ml-4">
                <li>
                  We will not be liable for any refund if a transaction is failed due to network error, electricity issues, or any other such reasons. RBP FINIVIS PRIVATE LIMITED will not be responsible for any failure caused due to irrelevant and invalid reasons.
                </li>
                <li>
                  We will not be liable for any refund after the purchase. Once the user agrees to use our services and conducts the payment, RBP FINIVIS PRIVATE LIMITED will not be responsible for any refund.
                </li>
                <li>
                  We will not be liable for any refund if the user fails to perform KYC at the initial stage. Each RBP FINIVIS PRIVATE LIMITED user has to go through a successful KYC verification once. Thus, it is mandatory to keep the correct KYC documents ready before initiating any payment to RBP FINIVIS PRIVATE LIMITED.
                </li>
              </ol>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Contact Us</h2>
              <p className="text-muted-foreground">
                For refund requests or queries, please contact us at hello@rbpfinivis.com with your transaction ID and details.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  </>
);

export default Refund;
