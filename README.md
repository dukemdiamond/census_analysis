# Cross-validation of CPS Data; Missing Values

## Summary

When analyzing the CPS data v. Dr. Rice's, I identified **41 variables** with values outside their documented valid ranges. The primary issue was missing value codes (-1, -2, -3) that weren't properly converted to Stata's missing value system (this is common when importing / processing Stata data to different types)

## Here are the variables which need to be recoded to handle missing values:

### **1. Negative Values That Should Be Missing (.)**

All variables below have negative minimum values that fall outside valid ranges and need recoding to Stata missing (`.`):

| Variable | Description | Data Min | Valid Min |
|----------|-------------|----------|-----------|
| **PEIO1OCD** | Occupation Code (CPS 4-digit) | -1 | 0 |
| **PEIO1ICD** | Industry Code | -1 | 0 |
| **PEERNHRO** | Usual Hours, if Paid Hourly | -2 | 0 |
| **PUCHINHH** | Change in HH Composition | -1 | 1 |
| **PEMLR** | Labor Force Status Category | -1 | 1 |
| **PUWK** | Worked Last Week - original | -3 | 1 |
| **PURETOT** | Retired - original | -1 | 1 |
| **PUABSOT** | Work Status Category | -3 | 1 |
| **PULAY** | On Layoff Last Week - original | -3 | 1 |
| **PEHRFTPT** | Usually Full Time | -3 | 1 |
| **PELKLL1O** | Status Before Job Search | -1 | 1 |
| **PELKLL2O** | Reason for Job Loss | -1 | 1 |
| **PEJHWKO** | Worked in the Last 12 Months - original | -1 | 1 |
| **PRABSREA** | Reason Not At Work_by Pay Status - original | -1 | 1 |
| **PRCIVLF** | In Civilian Labor Force | -1 | 1 |
| **PRDISC** | Discouraged Worker Category | -1 | 1 |
| **PRFTLF** | Full Time in Labor Force - original | -1 | 1 |
| **PRHRUSL** | Usual Weekly Hours | -1 | 1 |
| **PRPTHRS** | Reason Part-Time | -1 | 0 |
| **PRPTREA** | Detailed Reason Part-Time | -1 | 1 |
| **PEIO1COW** | Sector, First Job | -1 | 1 |
| **PRERNHLY** | Hourly Wage - original | -1 | 0 |
| **PEERNCOV** | Union Contract - original | -1 | 1 | 
| **PESCHENR** | Enrolled in School | -1 | 1 | 
| **PRERNWA** | Weekly Earnings * 100 | -1 | 0 | 

### **2. Derived Variables That Should Be Missing**

This was a little more tricky since they were derived variables - but by matching the full name -> CPS variable, there were 16 variables which fell out of the ranges and should be missing.

| Variable | Description | Data Min | Valid Min | Original CPS Source |
|----------|-------------|----------|-----------|-------------------|
| **REASON_ABSENT_FROM_WORK_01** | Reason Not At Work | -1 | 1 | PEABSRSN |
| **REASON_PART_TIME** | Reason Part-Time | 0.0 | 1 | PEHRRSN1 |
| **REASON_LESS_THAN_35HRS** | Reason <35 Hours Last Week | -1 | 1 | PEHRRSN3 |
| **WEEKS_LAID_OFF** | Weeks of Layoff | -1 | 1 | PELAYDUR |
| **WHEN_LAST_WORK** | When Last Worked, if Available for Work | -1 | 1 | PELKLWO |
| **WHEN_LAST_WORK_unemployed** | When Last Worked, if Not Employed | -3 | 1 | PENLFJH |
| **WEEKS_JOB_SEEKING** | Weeks of Job Search | -1 | 0 | PELKDUR |
| **WEEKS_OF_UNEMPLOYMENT** | Weeks of Unemployment | -1 | 0 | PRUNEDUR |
| **REASON_UNEMPLOYED** | Reason Unemployed | -1 | 1 | PRUNTYPE |
| **REASON_LEFT_JOB** | Reason Left Last Job | -1 | 1 | PEJHRSN |
| **DETAILED_INDUSTRY** | Detailed Industry | -1 | 1 | PRDTIND1 |
| **DETAILED_OCCUPATION** | Detailed Occupation | -1 | 1 | PRDTOCC1 |
| **MAJOR_INDUSTRY** | Major Industry | -1 | 1 | PRMJIND1 |
| **MAJOR_OCCUPATION** | Major Occupation | -1 | 1 | PRMJOCC1 |
| **HOURS_LAST_WEEK** | Total Actual Hours Last Week | -1 | 0 | PEHRACTT |
| **Work_Experience** | Work Experience | -12 | 0 | PRTAGE + calculation |

## Summary

- **Total 'problematic' variables**: 38
- **Original CPS Variables**: 25  
- **Derived variables**: 16
- **Why?**: Missing value codes (such as negative numbers) not converted to Stata missing (`.`)

## From here, recoding in Stata will be necessary to handle missing values.
