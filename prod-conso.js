d3.csv("prod-conso.csv").then(function(data) {
    // Convertir les dates et les valeurs numériques
    data.forEach(function(d) {
        d.Date = new Date(d.Date);
        d.Production_nette = +d.Production_nette;
        d.Consommation_Finale = +d.Consommation_Finale;
    });

   // Taille et marges du graphique
   const margin = { top: 20, right: 110, bottom: 50, left: 20 },
         width = window.innerWidth - margin.left - margin.right,
         height = window.innerHeight - margin.top - margin.bottom -30;

   // Création du SVG
   const svg = d3.select("#prod-conso").append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`);

    // Ajouter un groupe g pour contenir le graphique avec une transformation pour les marges
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Définir l'échelle des axes
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([3000, d3.max(data, d => Math.max(d.Production_nette, d.Consommation_Finale))])
        .nice()
        .range([height, 0]);


    // Définir la ligne pour la production
    const lineProduction = d3.line()
        .defined(d => !isNaN(d.Production_nette))
        .x(d => x(d.Date))
        .y(d => y(d.Production_nette))
        .curve(d3.curveStep);
    
    // Définir la ligne pour la consommation
    const lineConsommation = d3.line()
        .defined(d => !isNaN(d.Consommation_Finale))
        .x(d => x(d.Date))
        .y(d => y(d.Consommation_Finale))
        .curve(d3.curveStep);


    // Définir la zone où la consommation dépasse la production
    const areaAbove = d3.area()
        .defined(d => !isNaN(d.Production_nette) && !isNaN(d.Consommation_Finale) && d.Consommation_Finale > d.Production_nette)
        .x(d => x(d.Date))
        .y0(d => y(d.Production_nette))
        .y1(d => y(d.Consommation_Finale))
        .curve(d3.curveStep);

    // Définir la zone entre la production et la consommation
    const areaBetween = d3.area()
        .defined(d => !isNaN(d.Production_nette) && !isNaN(d.Consommation_Finale))
        .x(d => x(d.Date))
        .y0(d => y(d.Production_nette))
        .y1(d => y(d.Consommation_Finale))
        .curve(d3.curveStep);

    // Définir la zone au-dessus de la production
    const areaAboveProduction = d3.area()
        .defined(d => !isNaN(d.Production_nette))
        .x(d => x(d.Date))
        .y0(0)
        .y1(d => y(d.Production_nette))
        .curve(d3.curveStep);
    
    // Définir la zone en dessous de la consommation
    const areaBelowConsommation = d3.area()
        .defined(d => !isNaN(d.Consommation_Finale))
        .x(d => x(d.Date))
        .y0(height)
        .y1(d => y(d.Consommation_Finale))
        .curve(d3.curveStep);
      
        // Définir la zone en dessous de la consommation
    const areaBelowProduction = d3.area()
        .defined(d => !isNaN(d.Production_nette))
        .x(d => x(d.Date))
        .y0(height)
        .y1(d => y(d.Production_nette))
        .curve(d3.curveStep);


        // Zone en dessous de la production
        g.append("path")
        .datum(data)
        .attr("fill", "rgba(24,250,154, 0.5)")
        .attr("d",areaBelowProduction)
        .attr("class","area")
        .attr("id","areaBelowProduction")
  
        // Ajouter la zone en dessous de la consommation au graphique
        g.append("path")
        .datum(data)
        .attr("fill", "rgba(112, 128, 144, 1)")
        .attr("d", areaBelowConsommation)
        .attr("class", "area")
        .attr("id", "areaBelowConsommation");

        // Ajouter la zone où la consommation dépasse la production au graphique
        g.append("path")
            .datum(data)
            .attr("fill", "rgba(200,0,200,0.5)")
            .attr("d", areaAbove)
            .attr("class", "area")
            .attr("id", "areaAbove");
    

    // Ajouter les lignes 
    g.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", "rgba(46, 139, 87, 2)")
       .attr("stroke-width", 1.5)
       .attr("d", lineProduction)
       .attr("class", "line")
       .attr("id", "productionLine");     

   g.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", "rgba(0, 0, 0, 2)")
       .attr("stroke-width", 1.5)
       .attr("d", lineConsommation)
       .attr("class", "line")
       .attr("id", "consommationLine");

    // Ajouter les axes au graphique
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .call(d3.axisLeft(y));

    // Ajouter la légende avec interaction pour afficher/masquer les lignes et les zones
    g.append("rect")
        .attr("x", width - 180)
        .attr("y", 1)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill","rgba(24,250,154, 0.5)")
        .on("click", function() {
            toggleLine("areaBelowProduction");
            toggleLine("productionLine");
        });

    g.append("text")
        .attr("x", width - 160)
        .attr("y", 10)
        .attr("fill","rgba(210, 210, 210)")
        .text("Production Nette")
        .attr("class", "legend")
        .style("font-family","Arial")
        .on("click", function() {
            toggleLine("areaBelowProduction");
            toggleLine("productionLine");
        });

    g.append("rect")
        .attr("x", width - 180)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "rgba(112, 128, 144, 0.8)")
        .on("click", function() {
            toggleLine("areaBelowConsommation");
            toggleLine("consommationLine");
        });

    g.append("text")
        .attr("x", width - 160)
        .attr("y", 30)
        .attr("fill","rgba(210, 210, 210)")
        .text("Consommation Finale")
        .attr("class", "legend")
        .style("font-family","Arial")
        .on("click", function() {
            toggleLine("areaBelowConsommation");
            toggleLine("consommationLine");
        });
    
    g.append("rect")
        .attr("x", width - 180)
        .attr("y", 40)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "rgba(220,50,220,0.5)")
        .attr("class","legend")
        .on("click", function(){
            toggleLine("areaAbove")
        });
    
    g.append("text")
        .attr("x", width - 160)
        .attr("y", 50)
        .attr("fill","rgba(210, 210, 210)")
        .text("Déficit entre production")
        .attr("class","legend")
        .style("font-family","Arial")
        .on("click", function() {
            toggleLine("areaAbove");
        });
        g.append("text")
        .attr("x", width - 160)
        .attr("y", 66)
        .attr("fill","rgba(210, 210, 210)")
        .text("et consommation")
        .attr("class","legend")
        .style("font-family","Arial")
        .on("click", function() {
            toggleLine("areaAbove");
        });

    // Fonction pour afficher/masquer les lignes
    function toggleLine(lineId) {
        const line = document.getElementById(lineId);
        if (line.style.display === "none") {
            line.style.display = "initial";
        } else {
            line.style.display = "none";
        }}

    // Fonction pour afficher/masquer les zones
    function toggleArea(areaId) {
        const area = document.getElementById(areaId);
        if (area.style.display === "none") {
            area.style.display = "initial";
        } else {
            area.style.display = "none";
        }}
});

