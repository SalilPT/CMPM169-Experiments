// Title: "MyAnimeList Data Bubble Chart Thing"
// Description: "A bubble chart that visualizes the scores of the 250 most popular anime on MyAnimeList."
// Author: Your Name
// Date: March 2, 2023
// This piece uses the dataset from here: https://www.kaggle.com/datasets/brunobacelardc/myanimelist-top-1000-anime .
// It does not use up-to-date rankings.

const CHART_WIDTH = 1152;
let bubbleColorScale = d3.schemePaired.slice(0,5).concat(d3.schemePaired.slice(7));
let animeTypeColorGroups = ["Movie", "TV", "ONA", "OVA", "Special", "Music"];
let prevColor;
let canvasColor;
let currentColorLerpValue = 0;

/*
Bubble Chart Function

Note: Slightly modified from origin

Copyright 2021 Observable, Inc.
Released under the ISC license.
https://observablehq.com/@d3/bubble-chart
*/
function BubbleChart(data, {
  name = ([x]) => x, // alias for label
  label = name, // given d in data, returns text to display on the bubble
  value = ([, y]) => y, // given d in data, returns a quantitative size
  group, // given d in data, returns a categorical value for color
  title, // given d in data, returns text to show on hover
  link, // given a node d, its link (if any)
  linkTarget = "_blank", // the target attribute for links, if any
  width = 640, // outer width, in pixels
  height = width, // outer height, in pixels
  padding = 3, // padding between circles
  margin = 1, // default margins
  marginTop = margin, // top margin, in pixels
  marginRight = margin, // right margin, in pixels
  marginBottom = margin, // bottom margin, in pixels
  marginLeft = margin, // left margin, in pixels
  groups, // array of group names (the domain of the color scale)
  colors = d3.schemeTableau10, // an array of colors (for groups)
  fill = "#ccc", // a static fill color, if no group channel is specified
  fillOpacity = 0.7, // the fill opacity of the bubbles
  stroke, // a static stroke around the bubbles
  strokeWidth, // the stroke width around the bubbles, if any
  strokeOpacity, // the stroke opacity around the bubbles, if any
} = {}) {
  // Compute the values.
  const D = d3.map(data, d => d);
  const V = d3.map(data, value);
  const G = group == null ? null : d3.map(data, group);
  const I = d3.range(V.length).filter(i => V[i] > 0);

  // Unique the groups.
  if (G && groups === undefined) groups = I.map(i => G[i]);
  groups = G && new d3.InternSet(groups);

  // Construct scales.
  const color = G && d3.scaleOrdinal(groups, colors);

  // Compute labels and titles.
  const L = label == null ? null : d3.map(data, label);
  const T = title === undefined ? L : title == null ? null : d3.map(data, title);

  // Compute layout: create a 1-deep hierarchy, and pack it.
  const root = d3.pack()
      .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
      .padding(padding)
    (d3.hierarchy({children: I})
      .sum(i => V[i]));

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-marginLeft, -marginTop, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("fill", "currentColor")
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");

  const leaf = svg.selectAll("a")
    .data(root.leaves())
    .join("a")
      // .attr("xlink:href", link == null ? null : (d, i) => link(D[d.data], i, data))
      // .attr("target", link == null ? null : linkTarget)
      .attr("transform", d => `translate(${d.x},${d.y})`);

  leaf.append("circle")
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-opacity", strokeOpacity)
      .attr("fill", G ? d => color(G[d.data]) : fill == null ? "none" : fill)
      .attr("fill-opacity", fillOpacity)
      .attr("r", d => d.r);

  if (T) leaf.append("title")
      .text(d => T[d.data]);

  if (L) {
    // A unique identifier for clip paths (to avoid conflicts).
    const uid = `O-${Math.random().toString(16).slice(2)}`;

    leaf.append("clipPath")
        .attr("id", d => `${uid}-clip-${d.data}`)
      .append("circle")
        .attr("r", d => d.r);

    leaf.append("text")
        .attr("clip-path", d => `url(${new URL(`#${uid}-clip-${d.data}`, location)})`)
      .selectAll("tspan")
      .data(d => `${L[d.data]}`.split(/\n/g))
      .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
        .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
        .text(d => d);
  }

  return Object.assign(svg.node(), {scales: {color}});
}

let dataRows = [];
let files;
let chart;
d3.csv("./mal_top2000_anime.csv",
  (row) => {
    dataRows.push({
      title: row["Name"],
      type: row["Type"],
      popularityRank: row["Popularity Rank"],
      score: row["Score"]
    });
  }
// Stuff to do once the entire CSV file is loaded
).then(() => {
  // Sort data by popularity
  dataRows.sort((row1, row2) => {row1.popularityRank - row2.popularityRank});

  itemsToDisplay = dataRows.slice(0, 250);

  d3Chart = BubbleChart(itemsToDisplay, {
    label: d => d.title,
    value: d => Math.exp(2 * d.score),
    group: d => d.type,
    groups: animeTypeColorGroups,
    colors: bubbleColorScale,
    title: d => d.title + "\nType: " + d.type + "\nScore: " + d.score,
    width: CHART_WIDTH,
    stroke: "black",
    strokeWidth: 2,
    strokeOpacity: .16
  })
});

function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(CHART_WIDTH, 50);
  canvas.parent("canvas-container");
  // resize canvas is the page is resized
  $(window).resize(function() {
      console.log("Resizing...");
      resizeCanvas(CHART_WIDTH, 50);
  });
  textAlign(CENTER, TOP);
  textFont("Tahoma", 48);
  prevColor = color(255);
  canvasColor = color(255);

  // Insert the SVG element into the HTML document
  let d3ChartInsertedElement = document.getElementById("defaultCanvas0").insertAdjacentElement("afterend", d3Chart);
  d3ChartInsertedElement.addEventListener("mouseover", function(e) {
    if (e.target.tagName != "circle") {
      return;
    }

    let circleColor = e.target.getAttribute("fill");
    if (circleColor != canvasColor) {
      prevColor = lerpColor(prevColor, canvasColor, currentColorLerpValue);
      canvasColor = color(circleColor);
      currentColorLerpValue = 0;
    }
  });
}

function draw() {
  background(lerpColor(prevColor, canvasColor, currentColorLerpValue));
  currentColorLerpValue += 0.05;
  text("The 250 Most Popular Anime on MyAnimeList", width / 2, 0);
}