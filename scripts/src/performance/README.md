# Reproducing Validation Memory Issues

The validation client requires an entire dataset to be parsed into JS objects, in memory at one time, before being submitted to the validator. This is known to cause significant memory bottlenecks on applications.

The script `reproduceValidationMemory.ts` introduces a procedure to replicate and document this behaviour. A new version of the validation client will then be written and a new script will be added to demonstrate the ability to successfully parse much larger data sets.

## Script Process

The script first generates data for the following test cases:

1. Simple Dictionary, no cross-schema or cross-record restrictions
2. Wide Schema with Unique Key, no cross-schema restrictions
3. Multiple entities with relationships, has many foreign key restrictions

The script will first generate test data files in `./reproduceValidationMemory-data` with 1 million records of the base entity, and more of the child entities. If the data files already exist then data generation is skipped, the existing data will be used.

Then, each data set will be validated on a worker thread. That thread will log out to a file in `./reproduceValidationMemory-logs` so any errors that occur, and statuses along the way, can be monitored are referenced. Completed processes will report their memory usage and validation time stats to the main orchestration process. A process that crashes due to an out of memory error will be recorded as failing due to being OOM (out of memory). Only one child process will run at a time.

This script allocates a limited amount of memory to each child process to help prevent consuming all available memory on the host machine. By default this is 512Mb, and a script is left in the package.json to run this with 4GB heap allocated per child process.

## Reproduction Results

This test demonstrates that the in memory validation utility will fail when handling the content of TSVs that are significantly smaller than the available memory.

The most glaring issue is that the tsv after being parsed uses memory about 8x its file size. This means a submitter may compile a reasonably size tsv that has no way of fitting into application memory.

Our end goal is to be able to parse more data than can even fit into application memory (bounded by unique and FK index sizes). 

```
=== Data Generation ===

  [EXISTING] ./lectern/scripts/src/performance/reproduceValidationMemory-data/case1/all-types.tsv (1,000,000 records, 33.14 MB)
  [EXISTING] ./lectern/scripts/src/performance/reproduceValidationMemory-data/case2/wide-unique-key.tsv (1,000,000 records, 251.61 MB)
  [EXISTING] ./lectern/scripts/src/performance/reproduceValidationMemory-data/case3/program.tsv (1,000,000 records, 41.66 MB)
  [EXISTING] ./lectern/scripts/src/performance/reproduceValidationMemory-data/case3/study.tsv (5,000,000 records, 223.99 MB)
  [EXISTING] ./lectern/scripts/src/performance/reproduceValidationMemory-data/case3/institution.tsv (1,000,000 records, 17.55 MB)
  [EXISTING] ./lectern/scripts/src/performance/reproduceValidationMemory-data/case3/lab.tsv (2,000,000 records, 60.91 MB)
  [EXISTING] ./lectern/scripts/src/performance/reproduceValidationMemory-data/case3/cohort.tsv (10,000,000 records, 256.47 MB)
  [EXISTING] ./lectern/scripts/src/performance/reproduceValidationMemory-data/case3/enrollment.tsv (3,000,000 records, 85.93 MB)
  [EXISTING] ./lectern/scripts/src/performance/reproduceValidationMemory-data/case3/observation.tsv (5,000,000 records, 177.70 MB)

=== Validation Results ===

Case   | Schema(s)                           | Records    | Startup (MB)  | After Parse (MB) | After Validate (MB)  | Time (ms)   | ms/record   | Errors     | Status  
-------+-------------------------------------+------------+---------------+------------------+----------------------+-------------+-------------+------------+---------
1      | all-types                           | 100        | 10.2          | 10.8             | 11.1                 | 1           | 0.0100      | 0          | OK      
1      | all-types                           | 1,000      | 10.2          | 12.8             | 12.7                 | 2           | 0.0020      | 0          | OK      
1      | all-types                           | 10,000     | 10.3          | 12.0             | 16.4                 | 7           | 0.0007      | 0          | OK      
1      | all-types                           | 50,000     | 10.2          | 23.9             | 27.6                 | 25          | 0.0005      | 0          | OK      
1      | all-types                           | 100,000    | 10.3          | 28.9             | 23.4                 | 31          | 0.0003      | 0          | OK      
1      | all-types                           | 250,000    | 10.2          | 58.8             | 38.9                 | 72          | 0.0003      | 0          | OK      
1      | all-types                           | 500,000    | 10.3          | 84.3             | 89.2                 | 136         | 0.0003      | 0          | OK      
1      | all-types                           | 1,000,000  | 10.2          | 121.1            | 143.0                | 267         | 0.0003      | 0          | OK      
2      | wide-unique-key                     | 100        | 10.3          | 13.6             | 11.5                 | 2           | 0.0200      | 0          | OK      
2      | wide-unique-key                     | 1,000      | 10.2          | 13.8             | 13.7                 | 10          | 0.0100      | 0          | OK      
2      | wide-unique-key                     | 10,000     | 10.2          | 30.4             | 34.5                 | 62          | 0.0062      | 0          | OK      
2      | wide-unique-key                     | 50,000     | 10.2          | 120.3            | 121.5                | 282         | 0.0056      | 0          | OK      
2      | wide-unique-key                     | 100,000    | 10.3          | 215.3            | 222.0                | 514         | 0.0051      | 0          | OK      
2      | wide-unique-key                     | 250,000    | 10.2          | 484.3            | 510.1                | 1293        | 0.0052      | 0          | OK      
2      | wide-unique-key                     | 500,000    | 10.2          | 939.0            | 1006.5               | 2597        | 0.0052      | 0          | OK      
2      | wide-unique-key                     | 1,000,000  | 10.3          | 1850.3           | 1977.8               | 6179        | 0.0062      | 0          | OK      
3      | program, study, institution, lab, cohort, enrollment, observation | 2,700      | 10.2          | 13.7             | 15.9                 | 22     | 0.0081      | 3,147      | OK      
3      | program, study, institution, lab, cohort, enrollment, observation | 27,000     | 10.7          | 18.6             | 35.2                 | 234         | 0.0087  y    | 30,789     | OK      
3      | program, study, institution, lab, cohort, enrollment, observation | 270,000    | 10.2          | 70.1             | 158.0                | 13976       | 0.0518      | 298,682    | OK
```