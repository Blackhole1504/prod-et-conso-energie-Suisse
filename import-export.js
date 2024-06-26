(function() {
    // Taille et marges du graphique
    const margin = { top: 20, right: 110, bottom: 50, left: 40 },
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom - 30;

    // Création du SVG
    const svg1 = d3.select("#import-export").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("import-export.csv").then(data => {
        // Formatage des données
        data.forEach(d => {
            d.Date = d3.timeParse("%Y-%m")(d.Date);
            d.Importation = +d.Importation;
            d.Exportation = +d.Exportation;
        });

        // Définir les axes
        const x1 = d3.scaleTime()
            .domain(d3.extent(data, d => d.Date))
            .range([0, width]);

        const y1 = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.Importation, d.Exportation))])
            .range([height, 0]);

        svg1.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x1));

        svg1.append("g")
            .attr("class", "axis y-axis")
            .call(d3.axisLeft(y1));

        // Définir les lignes
        const lineImport1 = d3.line()
            .x(d => x1(d.Date))
            .y(d => y1(d.Importation));

        const lineExport1 = d3.line()
            .x(d => x1(d.Date))
            .y(d => y1(d.Exportation));

        // Dessiner les lignes et les points annimés
        function animation() {
            svg1.selectAll(".dot").remove();
            svg1.selectAll(".line").remove();

            // Dessiner les lignes
            drawSegment(data, lineImport1, "importation", 300, svg1);
            drawSegment(data, lineExport1, "exportation", 300, svg1);

            // Dessiner les points
            data.forEach((d, i) => {
                const dotImport = svg1.append("circle")
                    .attr("class", "dot")
                    .attr("cx", x1(d.Date))
                    .attr("cy", y1(d.Importation))
                    .attr("r", 5)
                    .attr("fill", "green")
                    .attr("opacity", 0)

                const dotExport = svg1.append("circle")
                    .attr("class", "dot")
                    .attr("cx", x1(d.Date))
                    .attr("cy", y1(d.Exportation))
                    .attr("r", 5)
                    .attr("fill", "red")
                    .attr("opacity", 0)

                // Afficher la date
                dotImport.append("title")
                    .text(formatDate(d.Date));
                dotExport.append("title")
                    .text(formatDate(d.Date));

                dotImport.transition()
                    .duration(300)
                    .delay(i * 300)
                    .attr("opacity", 1);
                dotExport.transition()
                    .duration(300)
                    .delay(i * 300)
                    .attr("opacity", 1);
            });
        }

        // Fonction pour formater la date
        function formatDate(date) {
            return d3.timeFormat("%Y-%m")(date);
        }


        animation();


    // Légende
    const Colors = ["green","red"];

    const legendLabels = ["Import", "Export"];

    const legend = svg1.selectAll(".legend")
        .data(legendLabels)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d, i) => Colors[i % Colors.length]);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .attr("fill","rgba(210, 210, 210)")
        .style("text-anchor", "end")
        .text(d => d);

        // Bouton pour recommencer l'animation
        d3.select("#restart").on("click", animation);
    });

    // Fonction pour dessiner les ligne
    function drawSegment(data, line, className, delay, svg) {
        const segments = data.length - 1;
        for (let i = 0; i < segments; i++) {
            const segmentData = data.slice(0, i + 2);
            svg.append("path")
                .datum(segmentData)
                .attr("class", `line ${className}`)
                .attr("d", line)
                .attr("stroke-dasharray", function() { return this.getTotalLength(); })
                .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
                .attr("opacity", 0)
                .transition()
                .duration(300)
                .delay(i * delay)
                .attr("stroke-dashoffset", 0)
                .attr("opacity", 1);
        }
    }

})();
