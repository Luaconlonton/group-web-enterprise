$(function () {
  $.validator.addMethod(
    "regex",
    function (value, element, regexp) {
      var re = new RegExp(regexp);
      return this.optional(element) || re.test(value);
    },
    "Please check your input."
  );
  $("#addTrainee").validate(
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
        date: {
          required: true,
          dateISO: true
        },
        picture: {
          regex: /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
        },
        education: "required"
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
$(function () {
  $.validator.addMethod(
    "regex",
    function (value, element, regexp) {
      var re = new RegExp(regexp);
      return this.optional(element) || re.test(value);
    },
    "Please check your input."
  );
  $("#updateProfile").validate(
    {
      rules:
      {
        name: {
          required: true,
          regex: /^[a-z A-Z]+$/
        },
        age : "required",
        address: "required"
      },
      messages: {
        name: {
          regex: "Please enter a text-only name"
        }
      }
    });
});