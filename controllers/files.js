// controllers/files.js
exports.install = function () {
  ROUTE("GET /");
  ROUTE("GET /files *Files -->query");
  ROUTE("POST /file/upload/ *Files --> create", ["upload"], 1024 * 100);
  ROUTE("GET /file/details/{id} *Files -->read");
  ROUTE("DELETE /file/remove/{id} *Files -->remove");
  ROUTE("GET /file/download/{id}", download);
  //  we add the download route, that maps to the download function in the current file
};

// now create the download function just below
function download(id) {
  // we are querying the database the find the file needed based on the id
  var query_builder = NOSQL("files").one();
  query_builder.where("id", id).callback(function (err, response) {
    //  and we then get the file from its folder and just save it
    this.res.file(response.f_path, response.f_name);
  });
}
