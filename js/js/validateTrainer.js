$(function () {
    $.validator.addMethod(
      "regex",
      function (value, element, regexp) {
        var re = new RegExp(regexp);
        return this.optional(element) || re.test(value);
      },
      "Please check your input."
    );
    $("#addTrainer").validate(
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
          age:
          {
            required: true,
            Number: true
          },
          picture: {
            regex: /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i
          },
          address: {
            required: true,
          },
          speciality:{
            required: true,
          }
        },
        messages: {
          name: {
            regex: "Please enter a text-only name"
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
    $("#updateTrainer").validate(
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
          age : "required",
          address: "required",
          speciality: "required"
        },
        messages: {
          name: {
            regex: "Please enter a text-only name"
          }
        }
      });
  });