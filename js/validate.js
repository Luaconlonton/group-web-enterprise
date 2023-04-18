$(function () {
    $.validator.addMethod(
      "regex",
      function (value, element, regexp) {
        var re = new RegExp(regexp);
        return this.optional(element) || re.test(value);
      },
      "Please check your input."
    );
    $("#add").validate(
      {
        rules:
        {
          name: {
            required: true,
            regex: /^[a-z A-Z]+$/
          },
          email:
          {
            required: true,
            email: true
          },
          date:
          {
            required: true,
            dateISO: true
          },
          picture: {
            regex: /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
          },
          address: {
            required: true,
          },
        },
        messages: {
          name: {
            regex: "Please enter a text-only name"
          },
          date: {
            dateIOS: "Please enter date in format (mm/dd/YYYY)"
          }
        }
      });
  });
  