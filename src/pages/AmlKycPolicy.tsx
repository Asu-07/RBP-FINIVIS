import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { companyInfo } from "@/data/mockData";

const AmlKycPolicy = () => {
  return (
    <>
      <Helmet>
        <title>AML & KYC Policy | {companyInfo.name}</title>
        <meta
          name="description"
          content="RBP FINIVIS Anti-Money Laundering (AML) and Know Your Customer (KYC) policies ensuring compliance with regulatory standards."
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-gradient-to-b from-primary to-primary/90">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-4">
                KYC / AML Policies
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Our commitment to preventing money laundering and terrorist financing
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <p className="text-muted-foreground leading-relaxed">
                {companyInfo.legalName} is committed to the highest standards of compliance against money laundering (AML) and anti-terrorist financing (CTF). The objective of the Company's Policy against Money Laundering and Terrorism Financing is to actively prevent the risks of these matters. To help the government combat the financing of terrorism and money laundering activities, the law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an account. We have an obligation to report suspicious client activity relevant to money laundering.
              </p>

              <h2 className="text-2xl font-heading font-semibold text-foreground mt-10 mb-4">
                Money Laundering
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The process of converting funds received from illegal activities (such as fraud, corruption, terrorism, etc.) into other funds or investments that appear legitimate to hide or distort the actual source of funds.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The money laundering process can be divided into three sequential stages:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Placement:</strong> At this stage, the funds are turned into financial instruments, such as checks, bank accounts, and money transfers, or they can be used to buy high-value goods that can be resold. They can also be physically deposited in banks and non-bank institutions (e.g., exchange houses). To avoid suspicion on the part of the company, the launderer can also make several deposits instead of depositing the entire sum at once.
                </li>
                <li>
                  <strong className="text-foreground">Layering:</strong> The funds are transferred or moved to other accounts and other financial instruments. It is done to disguise the origin and interrupt the indication of the entity that carried out the multiple financial transactions. Moving funds and changing their form makes it difficult to track the money that is being laundered.
                </li>
                <li>
                  <strong className="text-foreground">Integration:</strong> The funds are re-circulated as legitimate to purchase goods and services.
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                {companyInfo.legalName} adheres to the principles of Anti-Money Laundering and actively prevents any action that targets or facilitates the legalization process of illegally obtained funds. The AML policy means preventing the use of the company's services by criminals, with the objective of money laundering, terrorist financing or other criminal activity.
              </p>

              <h2 className="text-2xl font-heading font-semibold text-foreground mt-10 mb-4">
                To Prevent Money Laundering
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {companyInfo.legalName} does not accept or pay in cash under any circumstances. The company reserves the right to suspend the operation of any client, which may be considered illegal or, in the opinion of the staff, related to money laundering.
              </p>

              <h2 className="text-2xl font-heading font-semibold text-foreground mt-10 mb-4">
                Company Procedures
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {companyInfo.legalName} will ensure that it is a real or legal person. {companyInfo.legalName} also performs all the necessary measures in accordance with the applicable laws and regulations, issued by the monetary authorities. The AML policy is being met within FX of {companyInfo.legalName} by the following means:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Know your client's policy and due diligence</li>
                <li>Monitor customer activity</li>
                <li>Registry maintenance</li>
              </ul>

              <h2 className="text-2xl font-heading font-semibold text-foreground mt-10 mb-4">
                Know Your Customer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Due to the company's commitment to AML and KYC policies, each company customer must complete a verification procedure. Before {companyInfo.legalName} initiates any cooperation with the client, the company ensures that satisfactory evidence is presented or other measures are taken that produce satisfactory proof of the identity of any client or counterparty. The company also applies increased scrutiny to clients, who are residents of other countries, identified by credible sources as countries, who have inadequate AML standards or who may pose a high risk of crime and corruption and beneficial owners who reside in and whose funds are sourced from named countries.
              </p>

              <h3 className="text-xl font-heading font-semibold text-foreground mt-8 mb-3">
                Individual Clients
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                During the registration process, each client provides personal information, specifically: full name; birthdate; country of origin; and full residential address. The following documents are required to verify personal information:
              </p>
              <p className="text-muted-foreground leading-relaxed italic">
                (In case the documents are written in non-Latin characters, to avoid delays in the verification process, it is necessary to provide a notarized translation of the document in English due to KYC requirements)
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Valid passport (showing the first page of the local or international passport, where the photo and signature are clearly visible); or</li>
                <li>Driving license with photograph; or</li>
                <li>National identity card (showing the front and back)</li>
                <li>Documents proving current permanent address (such as utility bills, bank statements, etc.) containing the customer's full name and place of residence. These documents should not be older than 3 months from the filing date.</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold text-foreground mt-8 mb-3">
                Corporate Clients
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                In the event that the applicant company is listed on a recognized or approved stock exchange or when there is independent evidence to show that the applicant is a wholly owned subsidiary or a subsidiary under the control of said company, no further steps will normally be taken to verify the identity. In the event that the company is not listed and none of the main directors or shareholders already has an account with {companyInfo.legalName}, the following documentation must be provided:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Certificate of incorporation or any national equivalent</li>
                <li>Memorandum and Articles of Association and statutory declaration or any national equivalent</li>
                <li>Certificate of good standing or other proof of the company's registered address</li>
                <li>Resolution of the board of directors to open an account and grant authority to those who will operate it</li>
                <li>Copies of powers of attorney or other authorities granted by the directors in relation to the company</li>
                <li>Proof of the identity of the directors in case they deal with {companyInfo.legalName} on behalf of the Client (in accordance with the individual identity verification rules described above)</li>
                <li>Proof of identity of the final beneficiary(s) and/or the person(s) under whose instructions the signers of the account are empowered to act</li>
              </ul>

              <h2 className="text-2xl font-heading font-semibold text-foreground mt-10 mb-4">
                Tracking Customer Activity
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In addition to collecting customer information, {companyInfo.legalName} continues to monitor the activity of each customer to identify and prevent any suspicious transactions. A suspicious transaction is known as a transaction that is not consistent with the legitimate business of the customer or with the transaction history of the regular customer known by tracking customer activity. {companyInfo.legalName} has implemented the named transactions monitoring system (both automatic and, if necessary, manual) to prevent criminals from using the company's services.
              </p>

              <h2 className="text-2xl font-heading font-semibold text-foreground mt-10 mb-4">
                Registry Maintenance
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Records must be kept of all transaction data and data obtained for identification purposes, as well as all documents related to money laundering issues (e.g., suspicious activity reporting files, AML account monitoring documentation, etc.). Those records are kept for a minimum of 7 years after the account is closed.
              </p>

              <h2 className="text-2xl font-heading font-semibold text-foreground mt-10 mb-4">
                Measures Taken
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In cases of an attempt to execute transactions that {companyInfo.legalName} suspects are related to money laundering or other criminal activity, it will proceed in accordance with applicable law and report the suspicious activity to the regulatory authority.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {companyInfo.legalName} reserves the right to suspend the operation of any client, which may be considered illegal or may be related to money laundering in the opinion of the staff. {companyInfo.legalName} has full discretion to temporarily block the suspicious customer's account or terminate a relationship with an existing customer.
              </p>

              <h2 className="text-2xl font-heading font-semibold text-foreground mt-10 mb-4">
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                For more information about our AML/KYC policies, please contact us at{" "}
                <a href="mailto:compliance@rbpfinivis.com" className="text-accent hover:underline">
                  compliance@rbpfinivis.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default AmlKycPolicy;
