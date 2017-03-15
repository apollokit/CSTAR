# CSTAR
CesiumJS extensions developed at STAR Lab

## Extensions

- __grip__
 - create and run scripted sequences
- __dolly__
 - camera movement controls
- __debugger__
 - debug camera positioning/grip
- __auxrender__
 - entity render extensions

## How to use these tools

These extensions have been designed to be used as a [git submodule](https://chrisjean.com/git-submodules-adding-using-removing-and-updating/). Here's how to set them up:

### Adding to the repo

Register a submodule in somewhere your repository:

```bash
$ git submodule add git@github.mit.edu:star-lab/CSTAR.git path/to/submodule/mount/
```

To set up your repo, continue to the next step:

### On each clone

Git submodules are not automatically cloned, so you'll need to set those up manually. First, initialize the submodules:

```bash
$ git submodule init
```

Next, pull down the submodules:

```bash
$ git submodule update
```
