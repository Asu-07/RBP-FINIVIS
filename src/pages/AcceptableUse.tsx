import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";

const AcceptableUse = () => (
  <>
    <Helmet>
      <title>Acceptable Use Policy - RBP FINIVIS</title>
      <meta name="description" content="Acceptable use policy for RBP FINIVIS PRIVATE LIMITED products and services." />
    </Helmet>
    <Layout>
      <section className="gradient-hero py-16">
        <div className="container-custom text-center text-primary-foreground">
          <h1 className="text-4xl font-heading font-bold">Acceptable Use Policy</h1>
          <p className="text-primary-foreground/80 mt-2">Guidelines for using our products and services</p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container-custom max-w-3xl">
          <p className="text-muted-foreground mb-8">Last reviewed: 20th December 2025</p>
          
          <div className="space-y-8">
            <div>
              <p className="text-muted-foreground">
                This acceptable use policy covers the products, services, and technologies (collectively referred to as the "Products") provided by RBP FINIVIS PRIVATE LIMITED under any ongoing agreement. It's designed to protect us, our customers, and the general Internet community from unethical, irresponsible, and illegal activity.
              </p>
              <p className="text-muted-foreground mt-4">
                RBP FINIVIS PRIVATE LIMITED customers found engaging in activities prohibited by this acceptable use policy can be liable for service suspension and account termination. In extreme cases, we may be legally obliged to report such customers to the relevant authorities.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Fair Use</h2>
              <p className="text-muted-foreground">
                We provide our facilities with the assumption your use will be "business as usual", as per our offer schedule. If your use is considered to be excessive, then additional fees may be charged or capacity may be restricted.
              </p>
              <p className="text-muted-foreground mt-4">
                We are opposed to all forms of abuse, discrimination, rights infringement and/or any action that harms or disadvantages any group, individual or resource. We expect our customers and, where applicable, their users ("end-users") to likewise engage our Products with similar intent.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Customer Accountability</h2>
              <p className="text-muted-foreground">
                We regard our customers as being responsible for their own actions as well as for the actions of anyone using our Products with the customer's permission. This responsibility also applies to anyone using our Products on an unauthorized basis as a result of the customer's failure to put in place reasonable security measures.
              </p>
              <p className="text-muted-foreground mt-4">
                By accepting Products from us, our customers agree to ensure adherence to this policy on behalf of anyone using the Products as their end users. Complaints regarding the actions of customers or their end-users will be forwarded to the nominated contact for the account in question.
              </p>
              <p className="text-muted-foreground mt-4">
                If a customer — or their end-user or anyone using our Products as a result of the customer — violates our acceptable use policy, we reserve the right to terminate any Products associated with the offending account or the account itself or take any remedial or preventative action we deem appropriate without notice. To the extent permitted by law, no credit will be available for interruptions of service resulting from any violation of our acceptable use policy.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Prohibited Activity</h2>
              
              <h3 className="font-heading text-lg font-medium mb-2 mt-4">Copyright Infringement and Access to Unauthorised Material</h3>
              <p className="text-muted-foreground">
                Our Products must not be used to transmit, distribute or store any material in violation of any applicable law. This includes but isn't limited to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>Any material protected by copyright, trademark, trade secret or other intellectual property right used without proper authorization</li>
                <li>Any material that is obscene, defamatory, constitutes an illegal threat or violates export control laws</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                The customer is solely responsible for all material they input, upload, disseminate, transmit, create or publish through or on our Products, and for obtaining legal permission to use any works included in such material.
              </p>

              <h3 className="font-heading text-lg font-medium mb-2 mt-6">SPAM and Unauthorised Message Activity</h3>
              <p className="text-muted-foreground">
                Our Products must not be used for the purpose of sending unsolicited bulk or commercial messages in violation of the laws and regulations applicable to your jurisdiction ("spam"). This includes but isn't limited to sending spam, soliciting customers from spam sent from other service providers, and collecting replies to spam sent from other service providers.
              </p>
              <p className="text-muted-foreground mt-4">
                Our Products must not be used for the purpose of running unconfirmed mailing lists or telephone number lists ("messaging lists"). All messaging lists run on or hosted by our Products must be "confirmed opt-in".
              </p>
              <p className="text-muted-foreground mt-4">
                We prohibit the use of email lists, telephone number lists or databases purchased from third parties intended for spam or unconfirmed messaging list purposes on our Products.
              </p>

              <h3 className="font-heading text-lg font-medium mb-2 mt-6">Unethical, Exploitative, and Malicious Activity</h3>
              <p className="text-muted-foreground">
                Our Products must not be used for the purpose of advertising, transmitting or otherwise making available any software, program, product or service designed to violate this acceptable use policy, or the acceptable use policy of other service providers. This includes but isn't limited to facilitating the means to send spam and the initiation of network sniffing, pinging, packet spoofing, flooding, mail-bombing and denial-of-service attacks.
              </p>
              <p className="text-muted-foreground mt-4">
                Our Products must not be used to access any account or electronic resource where the group or individual attempting to gain access does not own or is not authorised to access the resource (e.g. "hacking", "cracking", "phreaking", etc.).
              </p>
              <p className="text-muted-foreground mt-4">
                Our Products must not be used for the purpose of intentionally or recklessly introducing viruses or malicious code into our Products and systems.
              </p>
              <p className="text-muted-foreground mt-4">
                Our Products must not be used for purposely engaging in activities designed to harass another group or individual. Our definition of harassment includes but is not limited to denial-of-service attacks, hate-speech, advocacy of racial or ethnic intolerance, and any activity intended to threaten, abuse, infringe upon the rights of or discriminate against any group or individual.
              </p>

              <h3 className="font-heading text-lg font-medium mb-2 mt-6">Other Prohibited Activities</h3>
              <ul className="list-decimal list-inside text-muted-foreground space-y-2 ml-4">
                <li>Obtaining (or attempting to obtain) services from us with the intent to avoid payment</li>
                <li>Using our facilities to obtain (or attempt to obtain) services from another provider with the intent to avoid payment</li>
                <li>The unauthorised access, alteration or destruction (or any attempt thereof) of any information about our customers or end-users, by any means or device</li>
                <li>Using our facilities to interfere with the use of our facilities and network by other customers or authorised individuals</li>
                <li>Publishing or transmitting any content of links that incite violence, depict a violent act, depict child pornography or threaten anyone's health and safety</li>
                <li>Any act or omission in violation of consumer protection laws and regulations</li>
                <li>Any violation of a person's privacy</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Our Products may not be used by any person or entity, which is involved with or suspected of involvement in activities or causes relating to illegal gambling; terrorism; narcotics trafficking; arms trafficking or the proliferation, development, design, manufacture, production, stockpiling, or use of nuclear, chemical or biological weapons, weapons of mass destruction, or missiles; in each case including any affiliation with others whatsoever who support the above such activities or causes.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Unauthorised Use of RBP FINIVIS PRIVATE LIMITED Property</h2>
              <p className="text-muted-foreground">
                We prohibit the impersonation of RBP FINIVIS PRIVATE LIMITED, the representation of a significant business relationship with RBP FINIVIS PRIVATE LIMITED, or ownership of any RBP FINIVIS PRIVATE LIMITED Property (including our Products and brand) for the purpose of fraudulently gaining service, custom, patronage or user trust.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">About This Policy</h2>
              <p className="text-muted-foreground">
                This policy outlines a non-exclusive list of activities and intent we deem unacceptable and incompatible with our brand. We reserve the right to modify this policy at any time by publishing the revised version on our website. The revised version will be effective from the earlier of:
              </p>
              <ul className="list-decimal list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>The date the customer uses our Products after we publish the revised version on our website; or</li>
                <li>30 days after we publish the revised version on our website.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  </>
);

export default AcceptableUse;
