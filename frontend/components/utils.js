exports.toTitleCase = function (str) {
    if (str) {
        return str.replace(
        /\w\S*/g,
        function(t) {
            return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
        }
        );
    } else {
        return "Unassigned"
    }
  }

