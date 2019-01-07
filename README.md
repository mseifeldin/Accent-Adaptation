# JS Adapt Demo

This is a fully worked replication of an audio-visual speech adaptation study (with some extensions), which we ran over [Amazon Mechanical Turk](http://www.mturk.com) and [presented at CogSci 2012](http://www.academia.edu/1532335/Kleinschmidt_D._F._and_Jaeger_T._F._2012_._A_continuum_of_phonetic_adaptation_Evaluating_an_incremental_belief-updating_model_of_recalibration_and_selective_adaptation._In_CogSci12).  With these files you should be able to get off the ground with similar web-based speech perception experiments.  

There are three parts of this package: the code for specifying the details of this particular experiment (`expt_vroomen_replication.*`), the code for deploying this experiment on Mechanical Turk (configuration files in `hits/` and scripts in `mturk-utils`), and the core JavaScript code for implementing a range of different experiments (scripts in `js-adapt/`).

The [development branch](https://bitbucket.org/dkleinschmidt/mtadapt-demo/src/5be9b9c757f85ed8b93632c2466e1a1a427b9a1b?at=devel) of this repository has a more up-to-date, much better documented, and possibly buggy version of everything.

## Quickstart experiment demo

This demo is [mirrored on the HLP Lab server](https://www.hlp.rochester.edu/mturk/mtadapt-demo/).

To run the demo from your own machine, clone this repository on your own computer.  Assuming you've downloaded it to `~/mtadapt-demo` (and have python), you can start a simple web server with: 

    cd ~/mtadapt-demo
    python -m SimpleHTTPServer
    
Then point your browser to [http://0.0.0.0:8000](http://0.0.0.0:8000).  This starts a lightweight webserver that listens to port 8000.  It's really slow so if you're doing a lot of testing locally I'd recomment a [node.js](http://nodejs.org) server instead ([download/install node.js](http://nodejs.org/download/) and then the [http-server app](https://github.com/nodeapps/http-server)).

## Workflow for running an experiment on Mechanical Turk

This repository also contains all the files necessary for using Mechanical Turk to recruit participants and collect and retrieve data.  In order to do this, you first need to install the set of shell scripts from Amazon which provide a command-line interface for Mechanical Turk.

You also need to host the HTML, JavaScript, and CSS files for the demo somewhere with a publicly visible URL.  The easiest way to do this is probably via a service like Dropbox, where you can drop the whole `mtadapt-demo` directory in and make it publicly visible.  Once you have an `http://` URL for the experiment HTML file, the workflow for running the experiment has three steps:

1. **Create the input files** for the Amazon MT command line interface.  Examples are found in the `hits` subdirectory.  
    * The `[experiment_name].properties` file specifies all the information visible to Turkers, including the title and description of the experiment HIT, the payment amount, and the amount of time they will have to complete the HIT.  The `.properties` file also specifies the number of assignments requested per HIT.
    * The `[experiment_name].input` file specifies the parameters of each HIT to be run, one on each line.  The first line gives the names of the parameters.
    * The `[experiment_name].question` file specifies how the parameters in the `.input` file are converted into something Mechanical Turk can actually display.  In this example, this is just a template for combining the parameters in the `.input` file into a URL, which Mechanical Turk automatically embeds in an `<iframe>` on the HIT's page.

2. **Post the batch of HITs to Mechanical Turk**, using the `mturk-utils/run.sh` script.  This script takes the prefix of the files described above (the `[experiment name]` part), and optional flags for running on the Sandbox (rather than the production, recommended for debugging), `-sandbox`, or doing nothing at all but echoing the commands that would be run (useful to check that the right input files are being used), `-n`

        $ mturk-utils/run.sh hits/vroomen-replication [-sandbox] [-n]

    Assuming that the HITs are successfully posted to Mechanical Turk, this results in a file listing the IDs of the HITs created, with the same prefix as the input files with an added date/time stamp and the `.success` suffix, as well as a `.log` file.  These files are symbolically linked to `[prefix]-LATEST.success` and `[prefix]-LATEST.log` files for convenience.

3. **Retrieve and parse results**. When results are available, they can be fetched using the `mturk-utils/retrieve.sh` script, and then parsed with `mturk-utils/parseResults2.py`. (You'll need to create the path `data/hits` if it doesn't exist prior to running parseResults2.py.)

        $ mturk-utils/retrieve.sh hits/vroomen-replication-LATEST
        $ mturk-utils/parseResults2.py hits/vroomen-replication-LATEST.results hits/vroomen_repl_results.cfg
    
    The `.cfg` file specifies which sections of the experiment should be written to which `.csv` files and what the headers for each file are.  The resulting `.csv` files can be read into whatever software you like for analysis.

    
# Core library

The core `js-adapt` javascript library orders and displays the stimuli, coordinates the various blocks of the experiment, excludes people who fail the pretest, collects the responses, and sends everything back to Amazon at the end.  It's included in this project (as a [subtree](http://psionides.eu/2010/02/04/sharing-code-between-projects-with-git-subtree/)), and is a separate repository that can be cloned [here](https://bitbucket.org/dkleinschmidt/jadapt) in case you want to include it in another project.  

The documentation is sparse at the moment, but this library is designed to make extending the existing types of experimental blocks relatively easy.  Right now there are two types of blocks:  `LabelingBlock`, which collects classification responses to audio/visual stimuli, and `ExposureBlock` which shows series of passively viewed/listened to adaptor stimuli with interposed test blocks and optional catch trials.

There are two extensions of the general `LabelingBlock` class, which demonstrate how you might extend this framework for your own purposes.  `CalibrationBlock` tests participants on a phonetic continuum, and then excludes participants with unacceptable performance.  `TestBlock` is a `LabelingBlock` which is interspersed throughout an `ExposureBlock` and which makes the appropriate callbacks when completed.

