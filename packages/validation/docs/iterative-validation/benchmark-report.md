# Validation Performance Benchmarks

Validation script was run under two conditions, first with restricted memory (512Mb), and second with enough memory to fit the entire data set in memory (4GB).

The restricted memory tests show that simply parsing the data set fails and validation cannot proceed for data sets larger than the provided heap size.

For tests with sufficient memory to parse the full data set, we get a view of the amount of memory that is used during validation. The tests with no errors recorded show that the memory used during validation is small, relative to the size of the full data set. For the multi-relationship data sets, we see many errors. This is expected behaviour since foreign key relationships will fail when we only load a partial data set. In this scenario, all the errors which are collected must be stored in memory during validation.

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

Multi-relationship validation becomes extremely slow beyond the 270k test.

| Case | Dictionary         | Records   | Startup (MB) | After Parse (MB) | Peak Validate (MB) | Time (s) | ms/record | Errors    | Status |
| ---- | ------------------ | --------- | ------------ | ---------------- | ------------------ | -------- | --------- | --------- | ------ |
| 1    | simple             | 100       | 11.1         | 9.0              | 9.3                | 0.000    | 0.0000    | 0         | OK     |
| 1    | simple             | 1,000     | 11.1         | 11.0             | 10.7               | 0.001    | 0.0010    | 0         | OK     |
| 1    | simple             | 10,000    | 11.1         | 14.2             | 10.4               | 0.007    | 0.0007    | 0         | OK     |
| 1    | simple             | 50,000    | 11.1         | 18.8             | 22.8               | 0.019    | 0.0004    | 0         | OK     |
| 1    | simple             | 100,000   | 11.1         | 24.2             | 34.2               | 0.031    | 0.0003    | 0         | OK     |
| 1    | simple             | 250,000   | 11.1         | 54.5             | 66.5               | 0.072    | 0.0003    | 0         | OK     |
| 1    | simple             | 500,000   | 11.1         | 79.6             | 195.7              | 0.138    | 0.0003    | 0         | OK     |
| 1    | simple             | 1,000,000 | 11.1         | 116.3            | 252.4              | 0.264    | 0.0003    | 0         | OK     |
| 2    | wide-unique-key    | 100       | 11.1         | 10.6             | 9.5                | 0.002    | 0.0200    | 0         | OK     |
| 2    | wide-unique-key    | 1,000     | 11.1         | 15.4             | 15.7               | 0.010    | 0.0100    | 0         | OK     |
| 2    | wide-unique-key    | 10,000    | 11.1         | 51.7             | 29.1               | 0.062    | 0.0062    | 0         | OK     |
| 2    | wide-unique-key    | 50,000    | 11.1         | 116.1            | 242.2              | 0.295    | 0.0059    | 0         | OK     |
| 2    | wide-unique-key    | 100,000   | 11.0         | 211.1            | 344.3              | 0.512    | 0.0051    | 0         | OK     |
| 2    | wide-unique-key    | 250,000   | 11.0         | 481.8            | 649.1              | 1.295    | 0.0052    | 0         | OK     |
| 2    | wide-unique-key    | 500,000   | 11.1         | 935.6            | 1170.9             | 2.742    | 0.0055    | 0         | OK     |
| 2    | wide-unique-key    | 1,000,000 | 11.1         | 1827.3           | 2055.2             | 6.856    | 0.0069    | 0         | OK     |
| 3    | multi-relationship | 2,700     | 11.1         | 11.8             | 14.2               | 0.016    | 0.0059    | 3,147     | OK     |
| 3    | multi-relationship | 27,000    | 11.0         | 13.7             | 118.9              | 0.238    | 0.0088    | 30,789    | OK     |
| 3    | multi-relationship | 270,000   | 11.1         | 65.0             | 292.4              | 14.934   | 0.0553    | 298,682   | OK     |
| 3    | multi-relationship | 1,350,000 | 11.1         | 237.7            | 832.7              | 531.647  | 0.3938    | 1,410,798 | OK     |
| 3    | multi-relationship | 2,700,000 | 11.1         | 424.5            | 1503.4             | 1990.531 | 0.7372    | 2,661,849 | OK     |
