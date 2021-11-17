async function readJson(path) {
  const response = await fetch(path);
  const data = await response.json();
  return data;
}

function getMax(collection) {
  let max = 0;

  collection.forEach((element) => {
    max = element > max ? element : max;
  });

  return max;
}

async function init() {
  // json file generated with https://csvjson.com/csv2json
  const data = await readJson('future_cities_data.json');
  let simplifiedData = data.map((d) => {
    return {
      annualMeanTemp: d['Annual_Mean_Temperature'],
      futureAnnualMeanTemp: d['future_Annual_Mean_Temperature'],
      city: d['current_city'],
    };
  });

  console.log('simplifiedData: ', simplifiedData);

  const chartWidth = 15000;
  const chartHeight = 830;
  const padding = 2;
  const paddingBetweenDataMembers = 4;
  const spacePerDataMember = chartWidth / simplifiedData.length;
  const barWidth =
    (spacePerDataMember - padding - paddingBetweenDataMembers) / 1.5;

  // We want our our bars to take up the full height of the chart, so, we will apply a scaling factor to the height of every bar.
  const futureAnnualMeanTempOnly = simplifiedData.map(
    (i) => i.futureAnnualMeanTemp
  ); // assuming that the max value can be found in the future row
  const heightScalingFactor = chartHeight / getMax(futureAnnualMeanTempOnly);

  const local = d3.local();

  const svg = d3
    .select('#d3')
    .append('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight);

  const tooltip = d3
    .select('#d3')
    .append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip') // for styling in css
    .style('visibility', 'hidden')
    .text('a simple tooltip');

  const selection = svg.selectAll('rect').data(simplifiedData).enter();

  //blau annual
  selection
    .append('rect') // For each element in the simplifiedData, append a new rectangle.
    .attr('fill', '#0062ff') // Sets the color of the bars.
    .attr('x', (value, index) => {
      // Set the X position of the rectangle by taking the index of the current item we are creating, multiplying it by the calculated width of each bar, and adding a padding value so we can see some space between bars.
      return index * spacePerDataMember + (barWidth *2) + padding;
    })
    .attr('y', (value, index) => {
      // Set the rectangle by subtracting the scaled height from the height of the chart (this has to be done becuase SVG coordinates start with 0,0 at their top left corner).
      return chartHeight - value.futureAnnualMeanTemp * heightScalingFactor;
    })
    .attr('height', (value, index) => {
      return barWidth;
    }) // The width is dynamically calculated to have an even distribution of bars that take up the entire width of the chart.
    .attr('width', (value, index) => {
      // The height is simply the value of the item in the simplifiedData multiplied by the height scaling factor.
      return value.annualMeanTemp * heightScalingFactor;
    })
    .attr('data-city', (value, index) => {
      return `${value.city}:${value.annualMeanTemp}°C`;
    })
    .on('mouseover', function () {
      const city = this.dataset.city;
      local.set(this, d3.select(this).attr('fill'));
      d3.select(this).attr('fill', '#001987');
      // show tooltip
      d3.select('#tooltip').text(city).style('visibility', 'visible');
    })
    ;

  // red future
  selection
    .insert('rect') // For each element in the simplifiedData, append a new rectangle.
    .attr('fill', '#fc03be') // Sets the color of the bars.
    .attr('x', (value, index) => {
      // Set the X position of the rectangle by taking the index of the current item we are creating, multiplying it by the calculated width of each bar, and adding a padding value so we can see some space between bars.
      return index * spacePerDataMember + barWidth + padding;
    })
    .attr('y', (value, index) => {
      // Set the rectangle by subtracting the scaled height from the height of the chart (this has to be done becuase SVG coordinates start with 0,0 at their top left corner).
      return chartHeight - value.futureAnnualMeanTemp * heightScalingFactor;
    })
    .attr('width', (value, index) => {
      return barWidth;
    }) // The width is dynamically calculated to have an even distribution of bars that take up the entire width of the chart.
    .attr('height', (value, index) => {
      // The height is simply the value of the item in the simplifiedData multiplied by the height scaling factor.
      return value.futureAnnualMeanTemp * heightScalingFactor;
    })
    .attr('data-city', (value, index) => {
      return `${value.city}:${value.futureAnnualMeanTemp}°C`;
    })
    .on('mouseover', function () {
      const city = this.dataset.city;
      local.set(this, d3.select(this).attr('fill'));
      d3.select(this).attr('fill', '#ff0000');
      // show tooltip
      d3.select('#tooltip').text(city).style('visibility', 'visible');
    });

  console.log('selection: ', selection);

  svg
    .selectAll('rect')
    .on('mousemove', function (event) {
      const coords = d3.pointer(event);
      // uncomment to see current x and y mouse positions
      // console.log( 'x: ', coords[0], 'y: ', coords[1] );

      d3.select('#tooltip')
        .style('left', coords[0] + 10 + 'px')
        .style('top', coords[1] - 10 + 'px');
    })
    .on('mouseout', function () {
      d3.select(this).attr('fill', local.get(this));
      d3.select('#tooltip').style('visibility', 'hidden');
    });
}

init();
