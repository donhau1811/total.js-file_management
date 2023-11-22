NEWSCHEMA("Files", function (schema) {
  schema.define("f_name", "String(64)");
  schema.define("f_extension", "String(8)");
  schema.define("f_path", "String(128)");
  schema.define("f_size", "String(64)");

  schema.action("query", {
    action: function ($) {
      var db = DB().find("nosql/files");
      $.query.search && db.search("search", $.query.search);
      db.fields("id,f_name,f_extension,f_path,f_size,dtcreated");
      db.sort("dtcreated_desc");
      db.callback($.callback);
    },
  });

  schema.action("read", {
    params: "id:UID",
    action: function ($) {
      var params = $.params;
      DB()
        .one("nosql/files")
        .error("@(File not found)")
        .where("id", params.id)
        .callback($.callback);
    },
  });

  schema.action("create", {
    action: function ($, model) {
      var file = $.files[0];
      model.id = UID();
      model.f_name = file.filename;
      model.f_extension = file.extension;
      model.f_size = file.size;
      model.f_path = PATH.public(`/downloads/${file.filename}`);
      model.dtcreated = NOW;
      DB()
        .insert("nosql/files", model)
        .callback((error, res) => {
          F.Fs.readFile(file.path, function (err, data) {
            if (err) {
              $.invalid(err);
              return;
            }
            F.Fs.writeFile(
              PATH.public(`/downloads/${file.filename}`),
              data,
              function () {
                $.success(model.id);
              }
            );
          });
        });
    },
  });

  schema.action("remove", {
    params: "id:UID",
    action: async function ($) {
      var params = $.params;
      DB()
        .one("nosql/files")
        .error("@(File not found)")
        .where("id", params.id)
        .callback((error, response) => {
          if (error) {
            $.invalid(error);
            return;
          }
          DB().remove("nosql/files").id(params.id);
          PATH.unlink(response.f_path);
        });
      $.success(params.id);
    },
  });
});
