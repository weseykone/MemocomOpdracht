/**
 * @properties={typeid:35,uuid:"C1EBD7AD-9520-49F9-B817-5108503A6A6A",variableType:-4}
 */
var client = plugins.http.createNewHttpClient();

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"C5250777-2E9D-4FB9-A031-0663C414C8AB"}
 */
var errorString = "";

/**
 * @param {string} id
 * @param {string} thid
 * @param {string} Voornaam
 * @param {string} Achternaam
 * @param {string} Email
 * @param {string} Status
 * @param {string} Kvk
 * @param {string} Admin
 * @param {string} created_at
 * @param {string} updated_at
 * @param {string} last_synced_by
 *
 * @properties={typeid:24,uuid:"B6F60F6B-4ED9-4355-A8E8-2F1FB48DC4FA"}
 */
function recordObject(id, thid, Voornaam, Achternaam, Email, Status, Kvk, Admin, created_at, updated_at, last_synced_by) {
	this.id = id || "";
	this.thid = thid || "";
	this.Voornaam = Voornaam || "";
	this.Achternaam = Achternaam || "";
	this.Email = Email || "";
	this.Status = Status || "";
	this.Kvk = Kvk || "";
	this.Admin = Admin || "";
	this.created_at = created_at || "";
	this.updated_at = updated_at || "";
	this.last_synced_by = last_synced_by || "";
}

/**
 * This function sends a get request to the given URL to see if the API is responding or not.
 * If the API is responding set the responds variable to true and return the value.
 * 
 * @return {boolean} responds
 * 
 * @properties={typeid:24,uuid:"74DA26DB-2238-421A-AB6B-5F47EAE77422"}
 */
function apiResponding() {
	var responds = false;
	var request = client.createGetRequest("https://webview.memocom.com/api/v1/ping");
	var response = request.executeRequest();
	var content = response.getResponseBody();

	var json = JSON.parse(content);
	if (json["status"] == "pong!")
		responds = true;
	else
		errorString = "The API is currently unavailable, please try again later."
	return responds;
}

/**
 * This function sends a get request to the given URL and if the HTTP code is 200
 * the response of the get request will be given to the parseData method.
 *
 * @properties={typeid:24,uuid:"701B64B6-F7DC-49B6-9E5C-5F592BD49D39"}
 */
function getData() {
	if (apiResponding()) {
		var request = client.createGetRequest('https://webview.memocom.com/api/v1/views/1514/records');
		request.addHeader("X-TOKEN-ID", "b6f66bda-9c65-420a-aa68-74bacc755735");
		request.addHeader("X-TOKEN-SECRET", "RYo5vzpzueDHcRHQuJQy");

		var response = request.executeRequest();
		var httpCode = response.getStatusCode(); // httpCode 200 is OK

		if (httpCode == 200) {
			var content = response.getResponseBody();
			parseData(content);
		} else {
			errorString = "A problem has occured with the http code: " + httpCode;
		}
	}
}

/**
 * This function parses the dataString to JSON and loops over the records in the JSON.
 * In the loop the records are made into recordObjects and pushed in the recordsArray.
 *
 * @param {string} dataString - String of data that needs to be parsed
 *
 * @properties={typeid:24,uuid:"9A167B89-8EAA-4D7A-AABB-3FD0A7EA84EC"}
 */
function parseData(dataString) {
	var recordsArray = [];
	var jsonData = JSON.parse(dataString);
	for (var i = 0; i < jsonData["records"].length; i++) {
		var record = jsonData["records"][i];

		var arrayObject = new recordObject(record["id"], record["thid"], record["Voornaam"], record["Achternaam"], record["Email"],
				record["Status"], record["van Bedrijf KvK"], record["Is admin"], record["created_at"], record["updated_at"], record["last_synced_by"]);

		recordsArray.push(arrayObject);
	}

	createDataForm(recordsArray);
}

/**
 * This function creates a new empty data set and fills the data set with the data from the recordsArray.
 * After that a new data source is created from the data set and this data source is used to create the a new form.
 * This form is used to show the data.
 *
 * @param recordsArray - An array of records which are taken from the API and used to get the data on screen.
 *
 * @properties={typeid:24,uuid:"C1A8BCED-C9D4-41D3-9097-301A4F4B0F2B"}
 */
function createDataForm(recordsArray) {
	var nameArray = ["id", "thid", "Voornaam", "Achternaam", "Email", "Status", "Kvk", "Admin", "created_at", "updated_at", "last_synced_by"]

	var fname = "dataform"
	if (!forms[fname]) {
		// create data set
		var ds = databaseManager.createEmptyDataSet()

		for (var j = 0; j < nameArray.length; j++) {
			ds.addColumn(nameArray[j]);
		}

		for (var k = 0; k < recordsArray.length; k++) {
			ds.addRow([recordsArray[k].id, recordsArray[k].thid, recordsArray[k].Voornaam, recordsArray[k].Achternaam,
			recordsArray[k].Email, recordsArray[k].Status, recordsArray[k].Kvk, recordsArray[k].Admin, recordsArray[k].created_at,
			recordsArray[k].updated_at, recordsArray[k].last_synced_by])
		}

		//Create a new data source, returns an URI that can be used to build forms on
		var uri = ds.createDataSource('mydata');

		// create form
		var jsform = solutionModel.newForm(fname, uri, null, true, 300, 300);

		for (var l = 0; l < nameArray.length; l++) {
			jsform.newTextField(nameArray[l], 160, 15 + (l * 25), 200, 20);
			jsform.newLabel(nameArray[l], 50, 15 + (l * 25), 100, 20)
		}
	}

	forms[fname].controller.show()
}
