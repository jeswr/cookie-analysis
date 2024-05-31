# cookie-analysis

## Usage

Run `npm i && npm run start` to start logging some sample cookie data.

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

I expect there to be static mapping from all fields except `description` and then for some NLP / RAG with generative models to be required to turn the natural language description into formal terms-of-use descriptions.

Here is an example App Policy that the website can have, with only the Google input spec (google cookie request):
 
```ttl
:ap a :AppPolicy;
	:name <urn:the-website:identifier>;
	:input_spec :cookie1;
	:output_spec :cookie1-out.  # Optional. Only if we want to also control/govern the actual cookie stored by the browser. Not used here.
:cookie1 a :InputSpec;
	:data <urn:cookie-data:number-search-result>, <urn:cookie-data:safesearch-filter-activated>;  # Some location to the exactly cookie. There is not yet a wildcard mechanism to match against "any plausible data", but we may consider it if needed. Another strategy is to assign the same set of over-permissive information to every potential cookie data, as a trick.
	:port [:name "some-unique-name"];
	:purpose [:name :marketing];  # The `Category`. Maybe define a concept parallel to :Purpose, e.g. :Category
	:downstream [
		:app_name <https://google.com>;  # The `Domain`
		:purpose :DownloadGoogleTools, :SavePreference, :AdjustAdsInGoogleSearch
	]
	.
```

And an example data policy (for a piece of cookie) would be:
```ttl
:data1 a :Data;
	:uri <urn:cookie-data:number-search-result>;
	:policy :dp.
:dp a :DataPolicy;
	:tagging :tag-marketing, :tag-down-tool, :tag-save-pref, :tag-adjust-ads;
	:attribute :attr-marketing :attr-down-tool, :attr-save-preference, :attr-adjust-ads.
:tag-marketing a :Purpose;  # Or, as commented above `:Category`
	:attribute_ref :attr-marketing:
 
:attr-marketing a :Attribute;
	:name _:a;
	:class :marketing;
	:value :nil.
:tag-down-tool a :Purpose;
	:attribute_ref :attr-down-tool.
 
:attr-down-tool a :Attribute;
	:name _:a;
	:class :DownloadGoogleTools;
	:value :nil.
:tag-save-pref a :Purpose;
	:attribute_ref :attr-save-preference.
 
:attr-save-preference a :Attribute;
	:name _:a;
	:class :SavePreference;
	:value :nil.
:tag-adjust-ads a :Purpose;
	:attribute_ref :attr-adjust-ads.
 
:attr-adjust-ads a :Attribute;
	:name _:a;
	:class :AdjustAdsInGoogleSearch;
	:value :nil.
```
 
This one is compatible with the application policy above (or, actually I should say it the other way around). But if you remove any tagging, it will become incompatible.

## License
©2024–present
[Jesse Wright](https://github.com/jeswr),
[MIT License](https://github.com/jeswr/cookie-analysis/blob/master/LICENSE).
