# Mapping JSON information to ODRL policy

The information available takes the form:
```json
{
    "site": "grooveshark.com",
    "ID": "8dc5d7e3-e31f-421a-8bad-6540172d787f",
    "Platform": "Google",
    "Category": "Marketing",
    "Cookie / Data Key name": "SID",
    "Domain": "google.com",
    "Description": "Download certain Google Tools and save certain preferences, for example the number of search results per page or activation of the SafeSearch Filter. Adjusts the ads that appear in Google Search.",
    "Retention period": "2 years",
    "Data Controller": "Google",
    "User Privacy & GDPR Rights Portals": "https://privacy.google.com/take-control.html",
    "Wildcard match": 0
}
```

Mapping to ODRL:
| Term                               | ODRL(+DPV) mapping                        |
|------------------------------------|-------------------------------------------|
| site                               | within odrl:target ?                      |
| ID                                 | odrl:uid                                  |
| Platform                           | odrl:assignee + dpv:hasName               |
| Category                           | odrl:purpose / oac:Purpose                |
| Cookie / Data Key name             | odrl:target                               |
| Domain                             | odrl:assignee + foaf:page (or equivalent) |
| Description                        | dcterms:description                       |
| Retention period                   | odrl:elapsedTime                          |
| Data Controller                    | odrl:assignee                             |
| User Privacy & GDPR Rights Portals | related to where to exercise rights?      |
| Wildcard match                     | not sure what this means                  |

The information can take the following form in ODRL:
```ttl
PREFIX odrl: <http://www.w3.org/ns/odrl/2/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX dpv: <https://w3id.org/dpv#>
PREFIX oac: <https://w3id.org/oac#>
PREFIX ex: <http://example.com>

<https://example.com/cookie-policy-grooveshark> a odrl:Request ;
    odrl:uid "8dc5d7e3-e31f-421a-8bad-6540172d787f" ;
    dcterms:description "Download certain Google Tools and save certain preferences, for example the number of search results per page or activation of the SafeSearch Filter. Adjusts the ads that appear in Google Search." ;
    dcterms:creator ex:google ;
    dcterms:issued "2024-06-03T17:58:31"^^xsd:dateTime ;
    odrl:profile oac: ;
    odrl:permission [
        odrl:assignee ex:google ;
        odrl:action oac:Download, oac:Store, oac:Profiling ;
        odrl:target <https://example.com/grooveshark-cookie-data> ;
        odrl:constraint [
            dcterms:title "Purpose for processing is to conduct marketing in relation to organisation or products or services." ;
            odrl:leftOperand odrl:purpose ; # oac:Purpose
            odrl:operator odrl:isA ;
            odrl:rightOperand dpv:Marketing ] ;
        odrl:constraint [
            dcterms:title "Rule can be exercised in the next 2 years." ;
            odrl:leftOperand odrl:elapsedTime ;
            odrl:operator odrl:eq ;
            odrl:rightOperand "P2Y"^^xsd:duration ]
    ] .

ex:google a dpv:DataController ;
    dpv:hasName "Google" ;
    foaf:page <google.com> .
```