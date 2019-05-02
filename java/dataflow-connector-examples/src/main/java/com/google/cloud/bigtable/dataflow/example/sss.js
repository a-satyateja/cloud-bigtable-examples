/**
 * Triggered from a change to a Cloud Storage bucket.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */





exports.helloGCS = (event, context) => {
	const { google } = require('googleapis');
	const dataflow = google.dataflow('v1b3');
	const TEMPLATE_BUCKET = `dataninja`;
	const gcsEvent = event;
	const fileName = gcsEvent.name;
	console.log(`Processing file: ${gcsEvent.name}`);
	console.log(`context is`, context);
	const inputFile = `gs://${TEMPLATE_BUCKET}/${fileName}`;
	const kickOffDataflow = (inputFile) => {
		var jobName = `dataflow_${fileName}`;
		var tmpLocation = `gs://${TEMPLATE_BUCKET}/tmp`;
		var templatePath = `gs://${TEMPLATE_BUCKET}/` +
			`DF_TEMPLATES`;
		var request = {
			projectId: process.env.GCLOUD_PROJECT,
			requestBody: {
				jobName: jobName,
				parameters: {
					input: inputFile
				},
				environment: {
					tempLocation: tmpLocation
				}
			},
			gcsPath: templatePath
		}
		return google.auth.getClient({
			scopes: ['https://www.googleapis.com/auth/cloud-platform']
		})
			.then(auth => {
				request.auth = auth;
				return dataflow.projects.templates.launch(request);
			})
			.catch(error => {
				console.error(error);
				throw error;
			});
	}

	kickOffDataflow(inputFile);
};



