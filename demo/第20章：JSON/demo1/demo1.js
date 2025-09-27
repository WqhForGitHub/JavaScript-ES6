let book = {
  title: "Professional JavaScript",
  authors: ["Matt Frisbie"],
  edition: 5,
  year: 2023,
  releaseDate: new Date(2023, 6, 1),
};

let jsonText = JSON.stringify(book, ["title", "edition"]);

let jsonText1 = JSON.stringify(book, (key, value) => {
  switch (key) {
    case "authors":
      return value.join(",");
    case "year":
      return 5000;
    case "edition":
      return undefined;
    default:
      return value;
  }
});

let jsonText2 = JSON.stringify(book, null, "--");

let bookCopy = JSON.parse(jsonText1, (key, value) =>
  key == "releaseDate" ? new Date(value) : value
);

console.log(bookCopy.releaseDate.getFullYear());
console.log(jsonText); // {"title":"Professional JavaScript","edition":5}
console.log(jsonText1); // {"title":"Professional JavaScript","authors":"Matt Frisbie","year":5000}
console.log(jsonText2);
/*
{
--"title": "Professional JavaScript",
--"authors": [
----"Matt Frisbie"
--],
--"edition": 5,
--"year": 2023
}
*/
