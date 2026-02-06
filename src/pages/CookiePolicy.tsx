import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";

const CookiePolicy = () => (
  <>
    <Helmet>
      <title>Cookie Policy - RBP FINIVIS</title>
      <meta name="description" content="Cookie policy for RBP FINIVIS PRIVATE LIMITED. Learn how we use cookies on our website." />
    </Helmet>
    <Layout>
      <section className="gradient-hero py-16">
        <div className="container-custom text-center text-primary-foreground">
          <h1 className="text-4xl font-heading font-bold">Cookie Policy</h1>
          <p className="text-primary-foreground/80 mt-2">How we use cookies on our website</p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container-custom max-w-3xl">
          <div className="space-y-8">
            <div>
              <p className="text-muted-foreground">
                We use cookies to help improve your experience of our website at https://rbpfinivis.com. This cookie policy is part of RBP FINIVIS PRIVATE LIMITED privacy policy. It covers the use of cookies between your device and our site.
              </p>
              <p className="text-muted-foreground mt-4">
                We also provide basic information on third-party services we may use, who may also use cookies as part of their service. This policy does not cover their cookies.
              </p>
              <p className="text-muted-foreground mt-4">
                If you don't wish to accept cookies from us, you should instruct your browser to refuse cookies from https://rbpfinivis.com. In such a case, we may be unable to provide you with some of your desired content and services.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">What is a Cookie?</h2>
              <p className="text-muted-foreground">
                A cookie is a small piece of data that a website stores on your device when you visit. It typically contains information about the website itself, a unique identifier that allows the site to recognise your web browser when you return, additional data that serves the cookie's purpose, and the lifespan of the cookie itself.
              </p>
              <p className="text-muted-foreground mt-4">
                Cookies are used to enable certain features (e.g. logging in), track site usage (e.g. analytics), store your user settings (e.g. time zone, notification preferences), and to personalise your content (e.g. advertising, language).
              </p>
              <p className="text-muted-foreground mt-4">
                Cookies set by the website you are visiting are usually referred to as first-party cookies. They typically only track your activity on that particular site.
              </p>
              <p className="text-muted-foreground mt-4">
                Cookies set by other sites and companies (i.e. third parties) are called third-party cookies. They can be used to track you on other websites that use the same third-party service.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">How Can You Control Our Website's Use of Cookies?</h2>
              <p className="text-muted-foreground">
                You have the right to decide whether to accept or reject cookies on our Website. You can manage your cookie preferences in our Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with the services on our Website.
              </p>
              <p className="text-muted-foreground mt-4">
                You may also be able to set or amend your cookie preferences by managing your web browser settings. As each web browser is different, please consult the instructions provided by your web browser (typically in the "help" section). If you choose to refuse or disable cookies you may still use the Website, though some of the functionality of the Website may not be available to you.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">How Often Will We Update This Cookie Policy?</h2>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time in order to reflect any changes to the cookies and related technologies we use, or for other operational, legal or regulatory reasons.
              </p>
              <p className="text-muted-foreground mt-4">
                Each time you use our Website, the current version of the Cookie Policy will apply. When you use our Website, you should check the date of this Cookie Policy and review any changes since the last version.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Where Can You Obtain Further Information?</h2>
              <p className="text-muted-foreground">
                For any questions or concerns regarding our Cookie Policy, you may contact us using the following details:
              </p>
              <p className="text-muted-foreground mt-4">
                <strong>Data Protection Officer (DPO)</strong><br />
                hello@rbpfinivis.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  </>
);

export default CookiePolicy;
