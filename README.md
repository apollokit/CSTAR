# CSTAR
CesiumJS extensions developed at STAR Lab

## Extensions

- [__grip__](docs/Grip.md)
 - create and run scripted sequences
- [__dolly__](docs/Dolly.md)
 - camera movement controls
- [__debugger__](docs/Debugger.md)
 - debug camera positioning/grip
- [__auxrender__](docs/AuxRenderer.md)
 - entity render extensions

## How to use these tools

These extensions have been designed to be used as a [git submodule](https://chrisjean.com/git-submodules-adding-using-removing-and-updating/). Here's how to set them up:

### Adding CSTAR to your repo

Register a submodule in somewhere your repository:

```bash
$ git submodule add git@github.com:apollokit/CSTAR.git path/to/submodule/mount/
```

To set up your repo, continue to the next step:

### On each clone of your repo

Git submodules are not automatically cloned, so you'll need to set those up manually. First, initialize the submodules:

```bash
$ git submodule init
```

Next, pull down the submodules:

```bash
$ git submodule update
```

