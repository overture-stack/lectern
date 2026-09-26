# Validation Performance Benchmarks

Validation script was run under two conditions, first with restricted memory (512Mb), and second with enough memory to fit the entire data set in memory (4GB).

The restricted memory tests show that simply parsing the data set fails and validation cannot proceed for data sets larger than the provided heap size.

For tests with sufficient memory to parse the full data set, we get a view of the amount of memory that is used during validation. The tests with no errors recorded show that the memory used during validation is small, relative to the size of the full data set.

The objective of the iterative Validation work is to never need to load the full dataset into memory. This should result in significantly smaller memory footprint used during comparable tests that stream the tsv values into the validator and then discard the records from memory.

## Sample Data Size

### Case 1

simple.tsv - 33 MB

Fully Parsed: 116.3 MB

### Case 2

wide-unique-key.tsv - 252 MB

Fully Parsed: 1827.3 MB

### Case 3

cohort.tsv - 256 MB
enrollment.tsv - 86 MB
generation-summary.md -105 MB
institution.tsv - 18 MB
lab.tsv - 61 MB
observation.tsv - 178 MB
program.tsv - 42 MB
study.tsv - 224 MB

Could not completely parse this data set within a 4 GB Heap.

## Original Implementation

Tests run on clean datasets with no errors, dramatically improves performance of original implementation (stores all errors in memory).

This is the 512 MB heap size test:

=== Validation Results ===

| Case | Dictionary         | Err Rate | Records   | Total Rec | Startup (MB) | After Parse (MB) | Peak Validate (MB) | Time (s) | ms/record | Errors | Status |
| ---- | ------------------ | -------- | --------- | --------- | ------------ | ---------------- | ------------------ | -------- | --------- | ------ | ------ |
| 1    | simple             | 0%       | 100       | 100       | 11.3         | 9.0              | 9.3                | 0.001    | 0.0100    | 0      | OK     |
| 1    | simple             | 0%       | 1,000     | 1,000     | 11.3         | 11.2             | 11.0               | 0.002    | 0.0020    | 0      | OK     |
| 1    | simple             | 0%       | 10,000    | 10,000    | 11.4         | 14.6             | 11.0               | 0.008    | 0.0008    | 0      | OK     |
| 1    | simple             | 0%       | 50,000    | 50,000    | 11.4         | 19.5             | 25.0               | 0.024    | 0.0005    | 0      | OK     |
| 1    | simple             | 0%       | 100,000   | 100,000   | 11.4         | 24.5             | 22.2               | 0.040    | 0.0004    | 0      | OK     |
| 1    | simple             | 0%       | 250,000   | 250,000   | 11.4         | 54.8             | 41.8               | 0.077    | 0.0003    | 0      | OK     |
| 1    | simple             | 0%       | 500,000   | 500,000   | 11.3         | 71.5             | 193.5              | 0.145    | 0.0003    | 0      | OK     |
| 1    | simple             | 0%       | 1,000,000 | 1,000,000 | 11.4         | 113.5            | 251.4              | 0.291    | 0.0003    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 100       | 100       | 11.4         | 10.7             | 9.9                | 0.002    | 0.0200    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 1,000     | 1,000     | 11.4         | 11.8             | 13.5               | 0.010    | 0.0100    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 10,000    | 10,000    | 11.4         | 26.3             | 48.1               | 0.060    | 0.0060    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 50,000    | 50,000    | 11.4         | 99.9             | 243.5              | 0.287    | 0.0057    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 100,000   | 100,000   | 11.4         | 201.2            | 357.3              | 0.545    | 0.0054    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 250,000   | 250,000   | 11.4         | 423.6            | 601.9              | 1.549    | 0.0062    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 500,000   | -         | 11.3         | -                | -                  | -        | -         | -      | OOM    |
| 2    | wide-unique-key    | 10%      | 100       | 100       | 11.4         | 10.7             | 9.9                | 0.002    | 0.0200    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 1,000     | 1,000     | 11.4         | 11.7             | 13.5               | 0.010    | 0.0100    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 10,000    | 10,000    | 11.4         | 51.4             | 47.5               | 0.064    | 0.0064    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 50,000    | 50,000    | 11.4         | 99.2             | 243.5              | 0.290    | 0.0058    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 100,000   | 100,000   | 11.4         | 201.9            | 356.5              | 0.550    | 0.0055    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 250,000   | -         | 11.4         | -                | -                  | -        | -         | -      | OOM    |
| 3    | multi-relationship | 0%       | 100       | 2,700     | 11.4         | 10.9             | 11.5               | 0.010    | 0.0037    | 0      | OK     |
| 3    | multi-relationship | 0%       | 1,000     | 27,000    | 11.3         | 16.8             | 24.3               | 0.071    | 0.0026    | 0      | OK     |
| 3    | multi-relationship | 0%       | 10,000    | 270,000   | 11.4         | 70.9             | 258.1              | 0.766    | 0.0028    | 0      | OK     |
| 3    | multi-relationship | 0%       | 50,000    | 1,350,000 | 11.4         | 219.3            | 638.4              | 4.811    | 0.0036    | 0      | OK     |
| 3    | multi-relationship | 0%       | 100,000   | -         | 11.4         | -                | -                  | -        | -         | -      | OOM    |
| 3    | multi-relationship | 10%      | 100       | 2,700     | 11.3         | 10.9             | 11.7               | 0.010    | 0.0037    | 220    | OK     |
| 3    | multi-relationship | 10%      | 1,000     | 27,000    | 11.3         | 16.2             | 19.5               | 0.084    | 0.0031    | 1,948  | OK     |
| 3    | multi-relationship | 10%      | 10,000    | 270,000   | 11.3         | 58.5             | 269.7              | 0.735    | 0.0027    | 17,940 | OK     |
| 3    | multi-relationship | 10%      | 50,000    | 1,350,000 | 11.4         | 220.7            | 646.1              | 4.776    | 0.0035    | 83,334 | OK     |
| 3    | multi-relationship | 10%      | 100,000   | -         | 11.3         | -                | -                  | -        | -         | -      | OOM    |

This is the 4GB heap size test:

=== Validation Results ===

| Case | Dictionary         | Err Rate | Records   | Total Rec  | Startup (MB) | After Parse (MB) | Peak Validate (MB) | Time (s) | ms/record | Errors  | Status |
| ---- | ------------------ | -------- | --------- | ---------- | ------------ | ---------------- | ------------------ | -------- | --------- | ------- | ------ |
| 1    | simple             | 0%       | 100       | 100        | 11.4         | 9.0              | 9.3                | 0.001    | 0.0100    | 0       | OK     |
| 1    | simple             | 0%       | 1,000     | 1,000      | 11.3         | 11.2             | 11.1               | 0.001    | 0.0010    | 0       | OK     |
| 1    | simple             | 0%       | 10,000    | 10,000     | 11.3         | 14.4             | 10.8               | 0.008    | 0.0008    | 0       | OK     |
| 1    | simple             | 0%       | 50,000    | 50,000     | 11.4         | 18.9             | 25.7               | 0.026    | 0.0005    | 0       | OK     |
| 1    | simple             | 0%       | 100,000   | 100,000    | 11.4         | 24.8             | 23.0               | 0.036    | 0.0004    | 0       | OK     |
| 1    | simple             | 0%       | 250,000   | 250,000    | 11.4         | 41.2             | 125.7              | 0.077    | 0.0003    | 0       | OK     |
| 1    | simple             | 0%       | 500,000   | 500,000    | 11.4         | 78.9             | 198.2              | 0.147    | 0.0003    | 0       | OK     |
| 1    | simple             | 0%       | 1,000,000 | 1,000,000  | 11.4         | 132.2            | 242.7              | 0.344    | 0.0003    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 100       | 100        | 11.3         | 10.7             | 9.9                | 0.003    | 0.0300    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 1,000     | 1,000      | 11.4         | 11.6             | 12.8               | 0.010    | 0.0100    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 10,000    | 10,000     | 11.4         | 26.2             | 47.8               | 0.069    | 0.0069    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 50,000    | 50,000     | 11.4         | 105.1            | 245.6              | 0.281    | 0.0056    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 100,000   | 100,000    | 11.4         | 208.6            | 357.7              | 0.555    | 0.0056    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 250,000   | 250,000    | 11.4         | 457.4            | 680.2              | 1.399    | 0.0056    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 500,000   | 500,000    | 11.4         | 910.6            | 1237.2             | 2.845    | 0.0057    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 1,000,000 | 1,000,000  | 11.3         | 1794.8           | 2237.8             | 6.166    | 0.0062    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 100       | 100        | 11.3         | 10.7             | 9.9                | 0.002    | 0.0200    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 1,000     | 1,000      | 11.4         | 15.4             | 17.7               | 0.010    | 0.0100    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 10,000    | 10,000     | 11.3         | 51.8             | 48.2               | 0.060    | 0.0060    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 50,000    | 50,000     | 11.4         | 104.2            | 245.5              | 0.283    | 0.0057    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 100,000   | 100,000    | 11.4         | 190.9            | 357.5              | 0.536    | 0.0054    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 250,000   | 250,000    | 11.4         | 456.2            | 683.1              | 1.397    | 0.0056    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 500,000   | 500,000    | 11.3         | 906.6            | 1236.3             | 2.799    | 0.0056    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 1,000,000 | 1,000,000  | 11.4         | 1814.2           | 2324.8             | 5.802    | 0.0058    | 0       | OK     |
| 3    | multi-relationship | 0%       | 100       | 2,700      | 11.3         | 11.0             | 11.6               | 0.009    | 0.0033    | 0       | OK     |
| 3    | multi-relationship | 0%       | 1,000     | 27,000     | 11.3         | 19.1             | 20.9               | 0.072    | 0.0027    | 0       | OK     |
| 3    | multi-relationship | 0%       | 10,000    | 270,000    | 11.4         | 76.0             | 258.2              | 0.743    | 0.0028    | 0       | OK     |
| 3    | multi-relationship | 0%       | 50,000    | 1,350,000  | 11.3         | 235.1            | 844.9              | 4.649    | 0.0034    | 0       | OK     |
| 3    | multi-relationship | 0%       | 100,000   | 2,700,000  | 11.4         | 441.1            | 1645.7             | 9.799    | 0.0036    | 0       | OK     |
| 3    | multi-relationship | 0%       | 250,000   | 6,750,000  | 11.4         | 1089.9           | 2608.8             | 29.391   | 0.0044    | 0       | OK     |
| 3    | multi-relationship | 0%       | 500,000   | 13,500,000 | 11.4         | 2151.7           | 3802.9             | 109.297  | 0.0081    | 0       | OK     |
| 3    | multi-relationship | 0%       | 1,000,000 | -          | 11.4         | -                | -                  | -        | -         | -       | OOM    |
| 3    | multi-relationship | 10%      | 100       | 2,700      | 11.3         | 10.9             | 11.7               | 0.010    | 0.0037    | 220     | OK     |
| 3    | multi-relationship | 10%      | 1,000     | 27,000     | 11.3         | 14.2             | 117.4              | 0.082    | 0.0030    | 1,948   | OK     |
| 3    | multi-relationship | 10%      | 10,000    | 270,000    | 11.4         | 56.3             | 268.9              | 0.754    | 0.0028    | 17,940  | OK     |
| 3    | multi-relationship | 10%      | 50,000    | 1,350,000  | 11.3         | 238.2            | 909.0              | 4.615    | 0.0034    | 83,334  | OK     |
| 3    | multi-relationship | 10%      | 100,000   | 2,700,000  | 11.4         | 441.8            | 1656.5             | 10.248   | 0.0038    | 162,644 | OK     |
| 3    | multi-relationship | 10%      | 250,000   | 6,750,000  | 11.4         | 1097.0           | 3185.9             | 29.049   | 0.0043    | 393,039 | OK     |
| 3    | multi-relationship | 10%      | 500,000   | -          | 11.4         | -                | -                  | -        | -         | -       | OOM    |

### Iterative Validator Implementation

This is the 512 MB heap size test:

=== Iterative Validation Results ===

| Case | Dictionary         | Err Rate | Records   | Total Rec | Startup (MB) | Peak Heap (MB) | Peak RSS (MB) | Time (s) | ms/record | Errors | Status |
| ---- | ------------------ | -------- | --------- | --------- | ------------ | -------------- | ------------- | -------- | --------- | ------ | ------ |
| 1    | simple             | 0%       | 100       | 100       | 11.4         | 11.4           | 0.0           | 0.002    | 0.0200    | 0      | OK     |
| 1    | simple             | 0%       | 1,000     | 1,000     | 11.3         | 12.2           | 0.0           | 0.005    | 0.0050    | 0      | OK     |
| 1    | simple             | 0%       | 10,000    | 10,000    | 11.4         | 19.0           | 0.0           | 0.023    | 0.0023    | 0      | OK     |
| 1    | simple             | 0%       | 50,000    | 50,000    | 11.4         | 23.7           | 0.0           | 0.083    | 0.0017    | 0      | OK     |
| 1    | simple             | 0%       | 100,000   | 100,000   | 11.4         | 31.1           | 105.6         | 0.156    | 0.0016    | 0      | OK     |
| 1    | simple             | 0%       | 250,000   | 250,000   | 11.4         | 60.3           | 148.0         | 0.395    | 0.0016    | 0      | OK     |
| 1    | simple             | 0%       | 500,000   | 500,000   | 11.4         | 110.2          | 226.9         | 0.818    | 0.0016    | 0      | OK     |
| 1    | simple             | 0%       | 1,000,000 | 1,000,000 | 11.4         | 190.0          | 321.3         | 1.786    | 0.0018    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 100       | 100       | 11.4         | 11.4           | 0.0           | 0.006    | 0.0600    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 1,000     | 1,000     | 11.4         | 12.6           | 0.0           | 0.024    | 0.0240    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 10,000    | 10,000    | 11.4         | 20.1           | 89.5          | 0.142    | 0.0142    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 50,000    | 50,000    | 11.3         | 33.8           | 124.2         | 0.673    | 0.0135    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 100,000   | 100,000   | 11.4         | 56.4           | 147.4         | 1.325    | 0.0132    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 250,000   | 250,000   | 11.4         | 109.6          | 232.7         | 3.329    | 0.0133    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 500,000   | 500,000   | 11.4         | 182.6          | 331.2         | 6.668    | 0.0133    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 1,000,000 | 1,000,000 | 11.4         | 335.0          | 521.8         | 13.549   | 0.0135    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 100       | 100       | 11.4         | 11.4           | 0.0           | 0.005    | 0.0500    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 1,000     | 1,000     | 11.4         | 12.6           | 0.0           | 0.024    | 0.0240    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 10,000    | 10,000    | 11.3         | 20.2           | 88.0          | 0.142    | 0.0142    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 50,000    | 50,000    | 11.4         | 37.2           | 124.5         | 0.673    | 0.0135    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 100,000   | 100,000   | 11.3         | 55.8           | 148.2         | 1.340    | 0.0134    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 250,000   | 250,000   | 11.4         | 110.0          | 231.6         | 3.314    | 0.0133    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 500,000   | 500,000   | 11.3         | 181.1          | 331.3         | 6.810    | 0.0136    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 1,000,000 | 1,000,000 | 11.4         | 333.7          | 522.0         | 13.442   | 0.0134    | 0      | OK     |
| 3    | multi-relationship | 0%       | 100       | 2,700     | 11.4         | 13.6           | 0.0           | 0.020    | 0.0074    | 0      | OK     |
| 3    | multi-relationship | 0%       | 1,000     | 27,000    | 11.4         | 36.8           | 105.6         | 0.141    | 0.0052    | 0      | OK     |
| 3    | multi-relationship | 0%       | 10,000    | 270,000   | 11.3         | 164.5          | 294.1         | 1.377    | 0.0051    | 0      | OK     |
| 3    | multi-relationship | 0%       | 50,000    | -         | 11.4         | -              | -             | -        | -         | -      | OOM    |
| 3    | multi-relationship | 10%      | 100       | 2,700     | 11.4         | 13.7           | 0.0           | 0.022    | 0.0081    | 220    | OK     |
| 3    | multi-relationship | 10%      | 1,000     | 27,000    | 11.4         | 30.6           | 126.1         | 0.147    | 0.0054    | 1,936  | OK     |
| 3    | multi-relationship | 10%      | 10,000    | 270,000   | 11.4         | 167.4          | 296.7         | 1.371    | 0.0051    | 17,875 | OK     |
| 3    | multi-relationship | 10%      | 50,000    | -         | 11.4         | -              | -             | -        | -         | -      | OOM    |

This is the 4Gb heap size test:

=== Iterative Validation Results ===

| Case | Dictionary         | Err Rate | Records   | Total Rec | Startup (MB) | Peak Heap (MB) | Peak RSS (MB) | Time (s) | ms/record | Errors  | Status |
| ---- | ------------------ | -------- | --------- | --------- | ------------ | -------------- | ------------- | -------- | --------- | ------- | ------ |
| 1    | simple             | 0%       | 100       | 100       | 11.4         | 11.4           | 0.0           | 0.002    | 0.0200    | 0       | OK     |
| 1    | simple             | 0%       | 1,000     | 1,000     | 11.4         | 12.1           | 0.0           | 0.005    | 0.0050    | 0       | OK     |
| 1    | simple             | 0%       | 10,000    | 10,000    | 11.4         | 11.6           | 0.0           | 0.023    | 0.0023    | 0       | OK     |
| 1    | simple             | 0%       | 50,000    | 50,000    | 11.4         | 22.3           | 0.0           | 0.086    | 0.0017    | 0       | OK     |
| 1    | simple             | 0%       | 100,000   | 100,000   | 11.4         | 31.5           | 106.4         | 0.175    | 0.0018    | 0       | OK     |
| 1    | simple             | 0%       | 250,000   | 250,000   | 11.4         | 60.8           | 152.8         | 0.437    | 0.0017    | 0       | OK     |
| 1    | simple             | 0%       | 500,000   | 500,000   | 11.3         | 108.0          | 227.8         | 0.859    | 0.0017    | 0       | OK     |
| 1    | simple             | 0%       | 1,000,000 | 1,000,000 | 11.4         | 203.9          | 325.1         | 1.835    | 0.0018    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 100       | 100       | 11.4         | 11.4           | 0.0           | 0.005    | 0.0500    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 1,000     | 1,000     | 11.4         | 12.6           | 0.0           | 0.025    | 0.0250    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 10,000    | 10,000    | 11.4         | 20.7           | 90.1          | 0.140    | 0.0140    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 50,000    | 50,000    | 11.4         | 30.9           | 127.8         | 0.669    | 0.0134    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 100,000   | 100,000   | 11.3         | 60.7           | 150.3         | 1.324    | 0.0132    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 250,000   | 250,000   | 11.4         | 104.7          | 236.2         | 3.359    | 0.0134    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 500,000   | 500,000   | 11.4         | 208.6          | 346.0         | 6.852    | 0.0137    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 1,000,000 | 1,000,000 | 11.4         | 351.2          | 521.1         | 13.679   | 0.0137    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 100       | 100       | 11.4         | 11.4           | 0.0           | 0.005    | 0.0500    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 1,000     | 1,000     | 11.4         | 12.5           | 0.0           | 0.023    | 0.0230    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 10,000    | 10,000    | 11.4         | 20.4           | 89.9          | 0.145    | 0.0145    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 50,000    | 50,000    | 11.4         | 29.9           | 127.2         | 0.686    | 0.0137    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 100,000   | 100,000   | 11.4         | 55.8           | 149.8         | 1.299    | 0.0130    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 250,000   | 250,000   | 11.4         | 106.9          | 233.2         | 3.370    | 0.0135    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 500,000   | 500,000   | 11.4         | 199.6          | 346.2         | 6.868    | 0.0137    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 1,000,000 | 1,000,000 | 11.4         | 343.7          | 526.1         | 13.471   | 0.0135    | 0       | OK     |
| 3    | multi-relationship | 0%       | 100       | 2,700     | 11.3         | 13.6           | 0.0           | 0.021    | 0.0078    | 0       | OK     |
| 3    | multi-relationship | 0%       | 1,000     | 27,000    | 11.4         | 28.6           | 109.1         | 0.136    | 0.0050    | 0       | OK     |
| 3    | multi-relationship | 0%       | 10,000    | 270,000   | 11.4         | 160.0          | 308.0         | 1.326    | 0.0049    | 0       | OK     |
| 3    | multi-relationship | 0%       | 50,000    | 1,350,000 | 11.4         | 728.7          | 930.0         | 7.591    | 0.0056    | 0       | OK     |
| 3    | multi-relationship | 0%       | 100,000   | 2,700,000 | 11.3         | 1367.4         | 1641.1        | 16.567   | 0.0061    | 0       | OK     |
| 3    | multi-relationship | 0%       | 250,000   | 6,750,000 | 11.4         | 3308.2         | 3649.1        | 54.165   | 0.0080    | 0       | OK     |
| 3    | multi-relationship | 0%       | 500,000   | -         | 11.4         | -              | -             | -        | -         | -       | OOM    |
| 3    | multi-relationship | 10%      | 100       | 2,700     | 11.3         | 13.8           | 0.0           | 0.030    | 0.0111    | 220     | OK     |
| 3    | multi-relationship | 10%      | 1,000     | 27,000    | 11.4         | 28.1           | 120.2         | 0.189    | 0.0070    | 1,936   | OK     |
| 3    | multi-relationship | 10%      | 10,000    | 270,000   | 11.4         | 168.5          | 308.9         | 1.386    | 0.0051    | 17,875  | OK     |
| 3    | multi-relationship | 10%      | 50,000    | 1,350,000 | 11.4         | 750.7          | 928.9         | 7.823    | 0.0058    | 83,068  | OK     |
| 3    | multi-relationship | 10%      | 100,000   | 2,700,000 | 11.3         | 1379.3         | 1453.6        | 18.095   | 0.0067    | 162,102 | OK     |
| 3    | multi-relationship | 10%      | 250,000   | 6,750,000 | 11.4         | 3272.4         | 3765.4        | 48.351   | 0.0072    | 391,794 | OK     |
| 3    | multi-relationship | 10%      | 500,000   | -         | 11.4         | -              | -             | -        | -         | -       | OOM    |
