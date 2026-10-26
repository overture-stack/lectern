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
| 1    | simple             | 0%       | 1,000     | 1,000     | 11.4         | 11.8           | 0.0           | 0.005    | 0.0050    | 0      | OK     |
| 1    | simple             | 0%       | 10,000    | 10,000    | 11.4         | 12.3           | 0.0           | 0.019    | 0.0019    | 0      | OK     |
| 1    | simple             | 0%       | 50,000    | 50,000    | 11.4         | 17.2           | 0.0           | 0.065    | 0.0013    | 0      | OK     |
| 1    | simple             | 0%       | 100,000   | 100,000   | 11.4         | 19.4           | 87.0          | 0.117    | 0.0012    | 0      | OK     |
| 1    | simple             | 0%       | 250,000   | 250,000   | 11.4         | 26.8           | 104.4         | 0.271    | 0.0011    | 0      | OK     |
| 1    | simple             | 0%       | 500,000   | 500,000   | 11.4         | 44.7           | 139.5         | 0.531    | 0.0011    | 0      | OK     |
| 1    | simple             | 0%       | 1,000,000 | 1,000,000 | 11.4         | 46.3           | 140.6         | 1.037    | 0.0010    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 100       | 100       | 11.4         | 11.4           | 0.0           | 0.005    | 0.0500    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 1,000     | 1,000     | 11.4         | 12.3           | 0.0           | 0.023    | 0.0230    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 10,000    | 10,000    | 11.4         | 19.3           | 88.3          | 0.133    | 0.0133    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 50,000    | 50,000    | 11.4         | 29.8           | 119.6         | 0.601    | 0.0120    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 100,000   | 100,000   | 11.4         | 51.1           | 167.5         | 1.215    | 0.0121    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 250,000   | 250,000   | 11.4         | 101.0          | 217.3         | 3.022    | 0.0121    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 500,000   | 500,000   | 11.4         | 170.3          | 294.0         | 5.957    | 0.0119    | 0      | OK     |
| 2    | wide-unique-key    | 0%       | 1,000,000 | 1,000,000 | 11.4         | 316.0          | 451.6         | 12.112   | 0.0121    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 100       | 100       | 11.4         | 11.4           | 0.0           | 0.005    | 0.0500    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 1,000     | 1,000     | 11.4         | 12.5           | 0.0           | 0.023    | 0.0230    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 10,000    | 10,000    | 11.4         | 15.5           | 87.7          | 0.133    | 0.0133    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 50,000    | 50,000    | 11.4         | 28.9           | 119.1         | 0.609    | 0.0122    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 100,000   | 100,000   | 11.4         | 66.8           | 168.0         | 1.213    | 0.0121    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 250,000   | 250,000   | 11.4         | 102.8          | 218.0         | 2.981    | 0.0119    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 500,000   | 500,000   | 11.4         | 177.3          | 293.6         | 5.954    | 0.0119    | 0      | OK     |
| 2    | wide-unique-key    | 10%      | 1,000,000 | 1,000,000 | 11.4         | 318.8          | 454.3         | 11.912   | 0.0119    | 0      | OK     |
| 3    | multi-relationship | 0%       | 100       | 2,700     | 11.4         | 12.6           | 0.0           | 0.017    | 0.0063    | 0      | OK     |
| 3    | multi-relationship | 0%       | 1,000     | 27,000    | 11.4         | 22.8           | 0.0           | 0.103    | 0.0038    | 0      | OK     |
| 3    | multi-relationship | 0%       | 10,000    | 270,000   | 11.4         | 78.7           | 249.5         | 0.964    | 0.0036    | 0      | OK     |
| 3    | multi-relationship | 0%       | 50,000    | 1,350,000 | 11.4         | 240.2          | 660.2         | 5.693    | 0.0042    | 0      | OK     |
| 3    | multi-relationship | 0%       | 100,000   | -         | 11.4         | -              | -             | -        | -         | -      | OOM    |
| 3    | multi-relationship | 10%      | 100       | 2,700     | 11.4         | 12.6           | 0.0           | 0.017    | 0.0063    | 220    | OK     |
| 3    | multi-relationship | 10%      | 1,000     | 27,000    | 11.4         | 20.6           | 0.0           | 0.104    | 0.0039    | 1,936  | OK     |
| 3    | multi-relationship | 10%      | 10,000    | 270,000   | 11.4         | 78.3           | 254.3         | 0.969    | 0.0036    | 17,875 | OK     |
| 3    | multi-relationship | 10%      | 50,000    | 1,350,000 | 11.4         | 240.3          | 657.7         | 5.759    | 0.0043    | 83,068 | OK     |
| 3    | multi-relationship | 10%      | 100,000   | -         | 11.4         | -              | -             | -        | -         | -      | OOM    |

This is the 4Gb heap size test:

=== Iterative Validation Results ===

| Case | Dictionary         | Err Rate | Records   | Total Rec  | Startup (MB) | Peak Heap (MB) | Peak RSS (MB) | Time (s) | ms/record | Errors  | Status |
| ---- | ------------------ | -------- | --------- | ---------- | ------------ | -------------- | ------------- | -------- | --------- | ------- | ------ |
| 1    | simple             | 0%       | 100       | 100        | 11.4         | 11.4           | 0.0           | 0.002    | 0.0200    | 0       | OK     |
| 1    | simple             | 0%       | 1,000     | 1,000      | 11.4         | 11.9           | 0.0           | 0.005    | 0.0050    | 0       | OK     |
| 1    | simple             | 0%       | 10,000    | 10,000     | 11.4         | 12.3           | 0.0           | 0.019    | 0.0019    | 0       | OK     |
| 1    | simple             | 0%       | 50,000    | 50,000     | 11.4         | 18.7           | 0.0           | 0.065    | 0.0013    | 0       | OK     |
| 1    | simple             | 0%       | 100,000   | 100,000    | 11.4         | 19.4           | 88.1          | 0.118    | 0.0012    | 0       | OK     |
| 1    | simple             | 0%       | 250,000   | 250,000    | 11.4         | 26.6           | 105.3         | 0.270    | 0.0011    | 0       | OK     |
| 1    | simple             | 0%       | 500,000   | 500,000    | 11.4         | 44.9           | 140.2         | 0.540    | 0.0011    | 0       | OK     |
| 1    | simple             | 0%       | 1,000,000 | 1,000,000  | 11.4         | 46.3           | 139.7         | 1.037    | 0.0010    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 100       | 100        | 11.4         | 11.4           | 0.0           | 0.005    | 0.0500    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 1,000     | 1,000      | 11.4         | 12.2           | 0.0           | 0.022    | 0.0220    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 10,000    | 10,000     | 11.4         | 15.1           | 88.1          | 0.133    | 0.0133    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 50,000    | 50,000     | 11.4         | 25.6           | 119.6         | 0.605    | 0.0121    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 100,000   | 100,000    | 11.4         | 59.3           | 169.5         | 1.178    | 0.0118    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 250,000   | 250,000    | 11.3         | 99.9           | 215.9         | 2.958    | 0.0118    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 500,000   | 500,000    | 11.4         | 187.4          | 300.6         | 5.942    | 0.0119    | 0       | OK     |
| 2    | wide-unique-key    | 0%       | 1,000,000 | 1,000,000  | 11.4         | 320.0          | 466.4         | 11.836   | 0.0118    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 100       | 100        | 11.4         | 11.4           | 0.0           | 0.005    | 0.0500    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 1,000     | 1,000      | 11.4         | 12.2           | 0.0           | 0.022    | 0.0220    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 10,000    | 10,000     | 11.4         | 15.2           | 88.4          | 0.134    | 0.0134    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 50,000    | 50,000     | 11.4         | 25.4           | 119.2         | 0.608    | 0.0122    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 100,000   | 100,000    | 11.4         | 67.2           | 170.3         | 1.170    | 0.0117    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 250,000   | 250,000    | 11.4         | 98.0           | 214.7         | 2.980    | 0.0119    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 500,000   | 500,000    | 11.4         | 184.7          | 300.6         | 5.859    | 0.0117    | 0       | OK     |
| 2    | wide-unique-key    | 10%      | 1,000,000 | 1,000,000  | 11.4         | 335.4          | 469.8         | 11.956   | 0.0120    | 0       | OK     |
| 3    | multi-relationship | 0%       | 100       | 2,700      | 11.4         | 12.4           | 0.0           | 0.017    | 0.0063    | 0       | OK     |
| 3    | multi-relationship | 0%       | 1,000     | 27,000     | 11.4         | 23.1           | 0.0           | 0.100    | 0.0037    | 0       | OK     |
| 3    | multi-relationship | 0%       | 10,000    | 270,000    | 11.4         | 80.6           | 255.9         | 0.953    | 0.0035    | 0       | OK     |
| 3    | multi-relationship | 0%       | 50,000    | 1,350,000  | 11.4         | 263.7          | 779.4         | 5.482    | 0.0041    | 0       | OK     |
| 3    | multi-relationship | 0%       | 100,000   | 2,700,000  | 11.4         | 467.1          | 1349.7        | 11.894   | 0.0044    | 0       | OK     |
| 3    | multi-relationship | 0%       | 250,000   | 6,750,000  | 11.4         | 1204.6         | 3177.8        | 32.731   | 0.0048    | 0       | OK     |
| 3    | multi-relationship | 0%       | 500,000   | 13,500,000 | 11.4         | 2412.0         | 4044.0        | 76.412   | 0.0057    | 0       | OK     |
| 3    | multi-relationship | 0%       | 1,000,000 | -          | 11.4         | -              | -             | -        | -         | -       | OOM    |
| 3    | multi-relationship | 10%      | 100       | 2,700      | 11.4         | 12.6           | 0.0           | 0.019    | 0.0070    | 220     | OK     |
| 3    | multi-relationship | 10%      | 1,000     | 27,000     | 11.4         | 20.5           | 101.2         | 0.111    | 0.0041    | 1,936   | OK     |
| 3    | multi-relationship | 10%      | 10,000    | 270,000    | 11.4         | 82.0           | 260.0         | 0.955    | 0.0035    | 17,875  | OK     |
| 3    | multi-relationship | 10%      | 50,000    | 1,350,000  | 11.4         | 266.7          | 779.2         | 5.454    | 0.0040    | 83,068  | OK     |
| 3    | multi-relationship | 10%      | 100,000   | 2,700,000  | 11.4         | 467.2          | 1352.5        | 12.071   | 0.0045    | 162,102 | OK     |
| 3    | multi-relationship | 10%      | 250,000   | 6,750,000  | 11.4         | 1196.5         | 2885.1        | 32.055   | 0.0047    | 391,794 | OK     |
| 3    | multi-relationship | 10%      | 500,000   | 13,500,000 | 11.4         | 2517.5         | 4039.3        | 76.801   | 0.0057    | 764,841 | OK     |
| 3    | multi-relationship | 10%      | 1,000,000 | -          | 11.4         | -              | -             | -        | -         | -       | OOM    |
