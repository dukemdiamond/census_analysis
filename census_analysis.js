// Read and parse the variable list CSV
const varlistData = await window.fs.readFile('varlistSheet1.csv', { encoding: 'utf8' });

import Papa from 'papaparse';
const parsedVarlist = Papa.parse(varlistData, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  delimitersToGuess: [',', '\t', '|', ';']
});

// Create lookup for variable names to descriptions
const varLookup = {};
parsedVarlist.data.forEach(row => {
  if (row.name && row['variable label or new name']) {
    varLookup[row.name] = row['variable label or new name'];
  }
});

// Parse summary statistics from tabstat output
const summaryText = `[your tabstat output here]`;

const lines = summaryText.split('\n');
const variables = [];

for (let line of lines) {
    if (line.includes('|') && !line.includes('Variable') && !line.includes('----')) {
        const parts = line.split('|');
        if (parts.length >= 2) {
            const varName = parts[0].trim();
            const statsText = parts[1].trim();
            const stats = statsText.split(/\s+/);
            
            if (stats.length >= 4) {
                variables.push({
                    name: varName,
                    mean: parseFloat(stats[0]),
                    min: parseFloat(stats[1]),
                    max: parseFloat(stats[2]),
                    n: parseFloat(stats[3])
                });
            }
        }
    }
}

// Define valid ranges from CPS documentation
const validRanges = {
    'PEIO1OCD': { min: 0, max: 9999, description: 'Occupation Code (CPS 4-digit)' },
    'HRMONTH': { min: 1, max: 12, description: 'Month of Interview' },
    'HRYEAR4': { min: 1998, max: 2999, description: 'Year of Interview' },
    'HRHTYPE': { min: 0, max: 10, description: 'Household Type' },
    'PEERNHRO': { min: 0, max: 99, description: 'Usual Hours, if Paid Hourly' },
    'HEFAMINC': { min: 1, max: 16, description: 'Family Income' },
    'PRTAGE': { min: 0, max: 85, description: 'Age' },
    'PEMARITL': { min: 1, max: 6, description: 'Marital Status' },
    'PESEX': { min: 1, max: 2, description: 'Sex' },
    'PEEDUCA': { min: 31, max: 46, description: 'Education Level' },
    'PTDTRACE': { min: 1, max: 26, description: 'Race' },
    'PUCHINHH': { min: 1, max: 9, description: 'Change in HH Composition' },
    'PULINENO': { min: 1, max: 99, description: 'Person Line Number' },
    'PEHSPNON': { min: 1, max: 2, description: 'Hispanic or Non-Hispanic' },
    'PRCITSHP': { min: 1, max: 5, description: 'Citizenship Status' },
    'PEMLR': { min: 1, max: 7, description: 'Labor Force Status Category' },
    'PUWK': { min: 1, max: 5, description: 'Worked Last Week - original' },
    'PURETOT': { min: 1, max: 3, description: 'Retired - original' },
    'PUABSOT': { min: 1, max: 5, description: 'Work Status Category' },
    'PULAY': { min: 1, max: 5, description: 'On Layoff Last Week - original' },
    'PEHRFTPT': { min: 1, max: 3, description: 'Usually Full Time' },
    'PEHRUSLT': { min: -4, max: 198, description: 'Total Hours' },
    'PELKLL1O': { min: 1, max: 4, description: 'Status Before Job Search' },
    'PELKLL2O': { min: 1, max: 3, description: 'Reason for Job Loss' },
    'PEJHWKO': { min: 1, max: 2, description: 'Worked in the Last 12 Months - original' },
    'PRABSREA': { min: 1, max: 40, description: 'Reason Not At Work_by Pay Status - original' },
    'PRCIVLF': { min: 1, max: 2, description: 'In Civilian Labor Force' },
    'PRDISC': { min: 1, max: 3, description: 'Discouraged Worker Category' },
    'PRFTLF': { min: 1, max: 2, description: 'Full Time in Labor Force - original (Yes=1, No=2)' },
    'PRHRUSL': { min: 1, max: 8, description: 'Usual Weekly Hours' },
    'PRPTHRS': { min: 0, max: 12, description: 'Reason Part-Time' },
    'PRPTREA': { min: 1, max: 23, description: 'Detailed Reason Part-Time' },
    'PEIO1COW': { min: 1, max: 8, description: 'Sector, First Job' },
    'PRERNHLY': { min: 0, max: 9999, description: 'Hourly Wage - original' },
    'PRERNWA': { min: 0, max: 288461, description: 'Weekly Earnings * 100' },
    'PEERNCOV': { min: 1, max: 2, description: 'Union Contract - original' },
    'PESCHENR': { min: 1, max: 2, description: 'Enrolled in School' },
    'PRCHLD': { min: -1, max: 15, description: 'Presence of Children' },
    'PEIO1ICD': { min: 0, max: 9999, description: 'Industry Code' }
};

// Compare data minimums with valid ranges
const problemVariables = [];

for (const variable of variables) {
    const varName = variable.name;
    const dataMin = variable.min;
    
    if (validRanges[varName]) {
        const validMin = validRanges[varName].min;
        const validMax = validRanges[varName].max;
        const description = validRanges[varName].description;
        
        if (dataMin < validMin) {
            problemVariables.push({
                variable: varName,
                dataMin: dataMin,
                dataMax: variable.max,
                validMin: validMin,
                validMax: validMax,
                description: description,
                issue: `Data minimum (${dataMin}) is below valid minimum (${validMin})`
            });
        }
        
        if (variable.max > validMax) {
            const existing = problemVariables.find(p => p.variable === varName);
            if (existing) {
                existing.issue += ` AND data maximum (${variable.max}) exceeds valid maximum (${validMax})`;
            } else {
                problemVariables.push({
                    variable: varName,
                    dataMin: dataMin,
                    dataMax: variable.max,
                    validMin: validMin,
                    validMax: validMax,
                    description: description,
                    issue: `Data maximum (${variable.max}) exceeds valid maximum (${validMax})`
                });
            }
        }
    }
}

// Find derived variables and their CPS origins
const derivedVariables = {};
parsedVarlist.data.forEach(row => {
  if (row.name && row.comments && row.comments.toLowerCase().includes('created from')) {
    const match = row.comments.match(/created from\s+["\*]*([A-Z_]+)["\*]*/i);
    if (match) {
      derivedVariables[row.name] = {
        description: row['variable label or new name'],
        originalVariable: match[1],
        comments: row.comments
      };
    }
  }
});

// Map truncated variable names to full names
const suspiciousVariables = [
  'REASON_ABSENT_FROM_WORK_01',
  'REASON_ABSENT_FROM_WORK_02', 
  'REASON_PART_TIME_ECON',
  'REASON_PART_TIME',
  'REASON_LESS_THAN_35HRS',
  'WEEKS_LAID_OFF',
  'WHEN_LAST_WORK',
  'WHEN_LAST_WORK_unemployed',
  'WEEKS_JOB_SEEKING',
  'WEEKS_OF_UNEMPLOYMENT',
  'REASON_UNEMPLOYED',
  'REASON_LEFT_JOB',
  'DETAILED_INDUSTRY',
  'DETAILED_OCCUPATION',
  'MAJOR_INDUSTRY',
  'MAJOR_OCCUPATION',
  'HOURS_LAST_WEEK',
  'HOURLY_WAGE',
  'Work_Experience'
];

const suspiciousOrigins = {};
parsedVarlist.data.forEach(row => {
  if (suspiciousVariables.includes(row.name)) {
    let originalVar = null;
    if (row.comments) {
      const patterns = [
        /created from\s+["\*]*([A-Z_0-9]+)["\*]*/i,
        /renamed from\s+["\*]*([A-Z_0-9]+)["\*]*/i,
        /from\s+["\*]*([A-Z_0-9]+)["\*]*/i
      ];
      
      for (let pattern of patterns) {
        const match = row.comments.match(pattern);
        if (match) {
          originalVar = match[1];
          break;
        }
      }
    }
    
    suspiciousOrigins[row.name] = {
      description: row['variable label or new name'],
      originalVariable: originalVar,
      comments: row.comments
    };
  }
});

// Output results
console.log(`Found ${problemVariables.length} variables with values outside valid ranges`);
console.log(`Found ${Object.keys(suspiciousOrigins).length} suspicious derived variables`);

problemVariables.forEach((prob, index) => {
    console.log(`${index + 1}. ${prob.variable} (${prob.description})`);
    console.log(`   Data range: ${prob.dataMin} to ${prob.dataMax}`);
    console.log(`   Valid range: ${prob.validMin} to ${prob.validMax}`);
    console.log(`   Issue: ${prob.issue}`);
});

Object.entries(suspiciousOrigins).forEach(([derived, info]) => {
  if (info.originalVariable) {
    console.log(`${derived} <- ${info.originalVariable}: ${info.description}`);
  }
});