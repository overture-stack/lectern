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

