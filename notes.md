https://genibushati.github.io/OntoCookie.io/

https://content.iospress.com/articles/semantic-web/sw233435
 - "According to Article 4(1) and Recital 30 of the GDPR, cookies and specifically cookie identifiers are viewed as personal data, which needs to be handled in compliance with the law."
 - "More specifically, 61% of the banners violated the purpose specificity requirement by mentioning vague purposes, including “user experience enhancement” while further, 30% of banners used positive framing, breaching the freely given and informed consent requirements."
 - visualisation is explicitly suggested by the European Union
(EU) in legislations such as the GDPR (Rec. 58, Art. 12(7)) as
 - one of the earliest and few studies on cookies through the lens of semantics is presented by Cox et al. [11]. The
authors explore the application of the Semantic Web in the privacy field and propose an approach for enriching
cookies with Resource Description Framework (RDF) fragments. 
 - "e would like to thank Harshvardhan J. Pandit for sharing
helpful insights on cookies, consent and GDPR."

https://www.usenix.org/system/files/sec22-bollinger.pdf
 -  90% of all websites using tracking cook-
ies, this means that many neglect to comply with the GDPR.
 - We develop a browser extension, CookieBlock,
that classifies cookies by purpose, removing those that the user rejects
 - Previous attempts to provide users such control,
like the P3P standard [10], failed due to a lack of willingness of website administrators to implement the functionality required.
 - We gathered a training dataset of cookies from 29 398 website that display cookie banners from a specific set of CMPs.
 - Cookiepedia assigns purposes to cookies based on their name [... so we need to be very careful with the Functional / Performance / Marketing labels], and was constructed
manually over a span of 10 years by experts in the domain
of browser cookies.
 - TODO: Work out how they did this ... We collect cookie purposes from consent management platforms (CMPs). In contrast to Cookiepedia, these purposes are chosen by the website administrators who control which
cookies are created in the users’ browsers [9,49].
 - Cookies have multiple attributes, including a name, domain,
path, value, expiration timestamp, as well as flags such as the
“HttpOnly,” “Secure,” “SameSite,” and “HostOnly” proper-
ties. There is no straightforward relationship between these
attributes and the cookies’ purpose. Therefore, we extract
statistically-rich, domain-specific features so that a machine-
learning model can extract a potentially complex, meaningful
relation from the data. [section 3 is useful!!!]