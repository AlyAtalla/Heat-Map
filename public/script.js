// Fetch temperature data
fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(response => response.json())
    .then(data => {
        const baseTemperature = data.baseTemperature;
        const dataset = data.monthlyVariance;

        // Chart dimensions
        const width = 1200;
        const height = 600;
        const padding = 100;

        // Prepare data
        const years = dataset.map(d => d.year);
        const months = dataset.map(d => d.month);

        // Scales
        const xScale = d3.scaleBand()
            .domain(years)
            .range([padding, width - padding])
            .padding(0);

        const yScale = d3.scaleBand()
            .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
            .range([padding, height - padding])
            .padding(0);

        // Color scale
        const colorScale = d3.scaleSequential()
            .domain([
                d3.min(dataset, d => d.variance),
                d3.max(dataset, d => d.variance)
            ])
            .interpolator(d3.interpolateRdBu);

        // Create SVG
        const svg = d3.select("#heatmap")
            .attr("width", width)
            .attr("height", height);

        // Tooltip
        const tooltip = d3.select("#tooltip");

        // Heatmap cells
        svg.selectAll(".cell")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScale(d.month))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d.variance))
            .attr("data-year", d => d.year)
            .attr("data-month", d => d.month - 1)
            .attr("data-temp", d => baseTemperature + d.variance)
            .on("mouseover", (event, d) => {
                const month = new Date(2000, d.month - 1).toLocaleString('default', { month: 'long' });
                tooltip.html(`
                    Year: ${d.year}<br>
                    Month: ${month}<br>
                    Temperature: ${(baseTemperature + d.variance).toFixed(2)}℃<br>
                    Variance: ${d.variance.toFixed(2)}℃
                `)
                .attr("data-year", d.year)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`)
                .classed("visible", true);
            })
            .on("mouseout", () => {
                tooltip.classed("visible", false);
            });

        // X-Axis (Years)
        const xAxis = d3.axisBottom(xScale)
            .tickValues(xScale.domain().filter(year => year % 10 === 0));
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(0, ${height - padding})`)
            .call(xAxis);

        // Y-Axis (Months)
        const monthNames = [
            "January", "February", "March", "April", 
            "May", "June", "July", "August", 
            "September", "October", "November", "December"
        ];
        const yAxis = d3.axisLeft(yScale)
            .tickFormat((d, i) => monthNames[i]);
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${padding}, 0)`)
            .call(yAxis);

        // Legend
        const legendWidth = 300;
        const legendHeight = 20;
        const legendPadding = 50;

        const legendScale = d3.scaleLinear()
            .domain([
                d3.min(dataset, d => d.variance),
                d3.max(dataset, d => d.variance)
            ])
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(4);

        const legend = svg.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(${width/2 - legendWidth/2}, ${height - legendPadding})`);

        // Legend color gradient
        const legendGradient = legend.append("defs")
            .append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        legendGradient.selectAll("stop")
            .data(colorScale.ticks().map((t, i, n) => ({
                offset: `${100*i/n.length}%`,
                color: colorScale(t)
            })))
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)");

        legend.append("g")
            .call(legendAxis)
            .attr("transform", `translate(0, ${legendHeight})`);
    });