const canvasElement = document.getElementById('gameStatistics').getContext('2d');
const canvasElement2 = document.getElementById('gameStatistics2').getContext('2d');
const canvasElement3 = document.getElementById('gameStatistics3').getContext('2d');
const graphElements = document.querySelector('.graphs');
console.log(graphElements.dataset.gamesData)
function convertStringToArray(string) {
    try {
      const jsonString = string.replace(/'/g, '"');
      const array = JSON.parse(jsonString);
      if (Array.isArray(array)) {
        return array;
      } else {
        throw new Error("Input is not a valid array.");
      }
    } catch (error) {
      console.error("Error:", error.message);
      return [];
    }
  }
  const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
  const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
const arrayGames = convertStringToArray(graphElements.dataset.gamesData);
const arrayGamesScore = arrayGames.map(game => game['score'])
const arrayGamesTime = arrayGames.map(game => {
    let date = new Date(game['time'])
    console.log(date);
    return monthNames[date.getMonth()] + " " + date.getDate()
})

const graphsdata = [
    {// First Graph
        labels: ["Wrong Anwsers", "Right Anwsers"],
        datasets: [
            {
                label:"Anwsers Overview",
                data:[10 - graphElements.dataset.anwsersRight, graphElements.dataset.anwsersRight],
                backgroundColor:[
                    'rgb(255,99,132)',
                    "rgb(123, 255, 0)"
                ],
                hoverOffset: 4
            }
        ]
    },
    {
        labels: ["1","2","3","4","5","6","7","8","9","10"],
        datasets: [{
            label: 'Total Points',
            data: JSON.parse(graphElements.dataset.anwsersArray),
            fill: true,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    {
        labels: arrayGamesTime,
        datasets: [{
          label: 'Game Score',
          data: arrayGamesScore,
          borderColor: 'rgb(75, 192, 192)',
          segment: {
            borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
            borderDash: ctx => skipped(ctx, [6, 6]),
          },
          spanGaps: true
        }]
    }
]

        // Create the doughnut chart
let myChart = new Chart(canvasElement, {
    type: 'doughnut',
    data: graphsdata[0],
    options: {
        responsive: false
   }
});
let myChart2 = new Chart(canvasElement2, {
    type: 'line',
    data: graphsdata[1],
    options: {
        responsive: false,
        scales: {
            y: {
                max: 20,
            }
        }
    }
});
let myChart3 = new Chart(canvasElement3, {
    type: 'line',
    data: graphsdata[2],
    options: {
        responsive: false,
    }
});
