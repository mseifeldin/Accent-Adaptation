/*
 * Author: Dave Kleinschmidt
 *
 *    Copyright 2012 Dave Kleinschmidt and
 *        the University of Rochester BCS Department
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Lesser General Public License version 2.1 as
 *    published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Lesser General Public License for more details.
 *
 *    You should have received a copy of the GNU Lesser General Public License
 *    along with this program.
 *    If not, see <http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html>.
 */

var _curBlock;

var vidSuffix, audSuffix;

var respDelim = ';';
var respKeyMap = {X: 'Word', M: 'Non-word'};
// response categories
var categories = ['Word', 'Non-word'];

// global variable for computing the size for each increment of the progress bar (see progressBar.js)
var pbIncrementSize;

// Experiment object to control everything
var e;

$(document).ready(function() 
{
    // create an experiment object with the necessary RSRB metadata
    e = new Experiment(
        {
            rsrbProtocolNumber: 'RSRB00045955',
            rsrbConsentFormURL: 'https://www.hlp.rochester.edu/consent/RSRB45955_Consent_2016-02-10.pdf'
        }
    );
    e.init();

        ///////////////////////////////////////////////////////////
    // parse relevant URL parameters
    e.sandboxmode = checkSandbox(e.urlparams);
    e.previewMode = checkPreview(e.urlparams);
//    e.previewMode = true;
    e.debugMode = checkDebug(e.urlparams);
    var isTest = false;
    // function in js-adapt/mturk_helpers.js sets global respKeyMap based on URL paramete
    // e.g.: ?respKeys=X,M would set 'X' to categories[1] and 'M' to categories[2].
    // !only supports two alpha keys/categories at the moment, and will choke on anything else!
    var group = e.urlparams['group'];         //which speaker we're hearing
    var respKeys = e.urlparams['respKeys'];         //which speaker we're hearing
    $("#group").val(e.urlparams['group'])
    $("#respKeys").val(e.urlparams['respKeys'])

    // e.urlparams is a dictionary (key-value mapping) of all the url params.
    // you can use these to control any aspect of your experiment you wish on a HIT-by-HIT
    // basis using the .question and .input files (see hits/vroomen-replication.* for examples)

    ////////////////////////////////////////////////////////////
    // Create and add blocks of experiment.

    ////////////////////////////////////////////////////////////////////////
    // Instructions

    // experiment intro and overall instructions
// var stim_id = e.urlparams['stimlist'];         //which stimuli list we're using
  //  var ks = e.urlparams['key'];         //which stimuli list we're using
    var instructions = new InstructionsSubsectionsBlock(
        {
            logoImg: 'logo.png',
            title: 'Listen and click',
            mainInstructions: ['Thanks for your interest in our study!  This HIT is a psychology experiment about how people understand speech.  Your task will be to listen to words, and to press a button on the keyboard to tell us what you heard.',
                               'Please read through each of the following items that will inform you about the study and its requirements. You can click the names below to expand or close each section. <span style="font-weight:bold;">You must read the eligibility requirements, the instructions, and the informed consent sections.</span>',
                               '<span style="font-weight:bold;">Please do not take this experiment more than once!</span>'],
            subsections: [
                {
                    title: 'Experiment length',
                    content: 'The experiment will 15-20 minutes to complete and you will be paid $2.00.'
                },
                {
                    title: 'Eligibility requirements',
                    content: ['Please complete this HIT in a quiet room, away from other noise ' +
                              'and wearing headphones.  Please do not look at other' +
                              ' web pages or other programs while completing this HIT, as it is very' +
                              ' important that you give it your full attention.',
                              {
                                  subtitle: 'Language requirements',
                                  content: '<span style="font-weight:bold;">You must be a native speaker of American English.</span>  If you have not spent almost all of your time until the age of 10 speaking English and living in the United States, you cannot participate.'
                              },
                              {
                                  subtitle: 'Repeats/multiple HITs',
                                  content: 'You cannot do this hit if you have done another version of this experiment (\'Listen and click\').  <span style="font-weight:bold;">If you do multiple HITs in this experiment, your work will be rejected</span>.  If you are unsure, please email us and we can check.'
                              },
                              {
                                  subtitle: 'Computer requirements',
                                  content: 'This experiment requires that your browser support javascript and that you have working headphones and a mouse (instead of a laptop trackpad).'
                              }
                             ],
                    checkboxText: 'I have read and understand the requirements.'
                },
                {
                    title: 'Sound check',
                    content: ['Please complete the following sound test to make sure your browser is compatible with this experiment, and that your headphones are set to a comfortable volume. It is important that you keep your speakers at the same volume throughout the experiment.',
                              'Click on each button below to play a word, and type each word in the box provided. You can play the soundfiles as many times as you need to to set your volume to the right level. Please type the words in all <b>lowercase</b> letters.  If you enter one of the words incorrectly, the box will turn red to prompt you to retry until you have entered them correctly.',
                              function() {
                                  var soundcheck = new SoundcheckBlock(
                                      {
                                          items: [
                                              {
                                                  filename: 'stimuli_soundcheck/cabbage',
                                                  answer: 'cabbage'
                                              },
                                              {
                                                  filename: 'stimuli_soundcheck/lemonade',
                                                  answer: 'lemonade'
                                              }
                                          ],
                                          instructions: ''
                                      }
                                  );
                                  return(soundcheck.init());
                              }]
                },
                {
                    title: 'Experiment instructions',
                    content: ['This experiment has two parts. In the first part, you will hear words and non-words. You will have to determine whether each one is a word or a non-word. In the second part, you will hear non-words and on the screen will be prompted to choose which non-word you heard each time'.format(categories[0], categories[1]),
                              {
                                  subtitle: 'Reasons work can be rejected:',
                                  content: 'There are two reasons that your work can be rejected.  First, <span style="font-weight:bold;">clicking randomly</span>. Second, <span style="font-weight:bold;">waiting an unreasonably long time before clicking</span> (for instance because you are away from the computer).  Please make sure to give yourself enough time to finish the entire experiment in one session.'}],
                    checkboxText: 'I have read and understood the instructions, and why work can be rejected.'
                },
                {
                    title: 'Informed consent',
                    content: e.consentFormDiv,
                    checkboxText: 'I consent to participating in this experiment'
                },
                {
                    title: 'Further (optional) information',
                    content: ['Sometimes it can happen that technical difficulties cause experimental scripts to freeze so that you will not be able to submit a HIT. We are trying our best to avoid these problems. Should they nevertheless occur, we urge you to <a href="mailto:hlplab@gmail.com">contact us</a>, and include the HIT ID number and your worker ID.',
                              'If you are interested in hearing how the experiments you are participating in help us to understand the human brain, feel free to subscribe to our <a href="http://hlplab.wordpress.com/">lab blog</a> where we announce new findings. Note that typically about one year passes before an experiment is published.'],
                    finallyInfo: true
                }
            ]
        }
    );
       // e.addBlock({block: instructions,
         //       onPreview: true});
        e.addBlock({block: instructions,
                onPreview: true});










































//SHORT VERSION OF EXPERIMENT


        //Do this do prevent loading the videos on preview.
        if (e.previewMode) 
        {
            e.nextBlock();
        }
        else 
        {

/////////////////////////////////////////////////////////////////////////////////////////////////////EXPOSURE BLOCK

//LOAD STIMULI
            var stimuli;

            if (group == "OneExpS") 
            {
               stimuli = new StimuliFileList(
                {
                        prefix: 'stimuli/',
                        mediaType: 'audio',
                        filenames: ['V1ECS_Obscene_s14', 'V1ECS_Compensate_s14', 'V1ECS_Parasite_s14', 'V1ECS_Episode_s14', 'V1ECS_Medicine_s14', 
                        'V1EFR_Bakery', 'V1EFR_Bullying', 'V1EFR_Corridor', 'V1EFR_Directory', 'V1EFR_Eighty', 'V1EFR_Embody', 'V1EFR_Family', 'V1EFR_Grammatical', 'V1EFR_Hamburger', 'V1EFR_Heroine',
                        'V1EFN_anolipa', 'V1EFN_baliber', 'V1EFN_dadigal', 'V1EFN_halken', 'V1EFN_igoldion', 'V1EFN_kerkrun', 'V1EFN_niritaly', 'V1EFN_raiakaridy', 'V1EFN_rakil', 'V1EFN_ryligal'],
                        choices: ['WORD', 'NONWORD'],

                }
                )
            }

            if (group == "OneExpH") 
            {
                stimuli = new StimuliFileList(
                {
                        prefix: 'stimuli/',
                        mediaType: 'audio',
                        filenames: ['V1ECH_Initial_s14', 'V1ECH_Impatient_s14', 'V1ECH_Pediatrician_s14', 'V1ECH_Parachute_s14', 'V1ECH_Glacier_s14', 
                        'V1EFR_Bakery', 'V1EFR_Bullying', 'V1EFR_Corridor', 'V1EFR_Directory', 'V1EFR_Eighty', 'V1EFR_Embody', 'V1EFR_Family', 'V1EFR_Grammatical', 'V1EFR_Hamburger', 'V1EFR_Heroine',
                        'V1EFN_anolipa', 'V1EFN_baliber', 'V1EFN_dadigal', 'V1EFN_halken', 'V1EFN_igoldion', 'V1EFN_kerkrun', 'V1EFN_niritaly', 'V1EFN_raiakaridy', 'V1EFN_rakil', 'V1EFN_ryligal'],
                        var categories : ['WORD', 'NONWORD'];
                        setRespKeys(e.urlparams, categories);
                //respKeys=e.urlparams
                }
                )
            }


//CREATE VARIABLE AND DESIGNATE REPETITIONS OF STIMULI
            var Exposure = new LabelingBlock ({stimuli: stimuli,
                                  reps: 1,
                                  namespace: "Exposure"})

//CREATE NEW BLOCK AND ADD VARIABLE (WHICH CONTAINS STIMULI) TO THE BLOCK. DESIGNATE INSTRUCTIONS AND PREVIEW STATUS                                   
             e.addBlock(
                  {
                      block: Exposure,
                      instructions:'<h3>Section 1</h2><p>In this section, you will hear words and non-words. Using the keys designated on the screen, please categorize each utterance you hear. Listen carefully, but please answer as quickly and accurately as possible.</p>',
                      onPreview: false,
                  }
             );





////////////////////////////////////////////////////////////////////////////////////LABELING BLOCK

//LOAD STIMULI

            if (group == "OneExpS") 
            {
                lbstimuli = new StimuliFileList(
                {
                        prefix: 'stimuli/',
                        mediaType: 'audio',
                        filenames: ['V1TN_Bissrog_s5','V1TN_Bissrog_s8','V1TN_Bissrog_s11','V1TN_Bissrog_s13','V1TN_Bissrog_s14','V1TN_Bissrog_s15','V1TN_Bissrog_s16','V1TN_Bissrog_s17','V1TN_Bissrog_s18','V1TN_Bissrog_s19','V1TN_Bissrog_s21','V1TN_Bissrog_s24','V1TN_Bissrog_s27',
                                    'V6TN_Bissrog_s5','V6TN_Bissrog_s8','V6TN_Bissrog_s11','V6TN_Bissrog_s13','V6TN_Bissrog_s14','V6TN_Bissrog_s15','V6TN_Bissrog_s16','V6TN_Bissrog_s17','V6TN_Bissrog_s18','V6TN_Bissrog_s19','V6TN_Bissrog_s21','V6TN_Bissrog_s24','V6TN_Bissrog_s27'],
                        choices: {'V1TN_Bissrog_s5':['BISSROG','BISHROG'],'V1TN_Bissrog_s8':['BISSROG','BISHROG'],'V1TN_Bissrog_s11':['BISSROG','BISHROG'],'V1TN_Bissrog_s13':['BISSROG','BISHROG'],'V1TN_Bissrog_s14':['BISSROG','BISHROG'],'V1TN_Bissrog_s15':['BISSROG','BISHROG'],'V1TN_Bissrog_s16':['BISSROG','BISHROG'],'V1TN_Bissrog_s17':['BISSROG','BISHROG'],'V1TN_Bissrog_s18':['BISSROG','BISHROG'],'V1TN_Bissrog_s19':['BISSROG','BISHROG'],'V1TN_Bissrog_s21':['BISSROG','BISHROG'],'V1TN_Bissrog_s24':['BISSROG','BISHROG'],'V1TN_Bissrog_s27':['BISSROG','BISHROG'],
                                    'V6TN_Bissrog_s5':['BISSROG','BISHROG'],'V6TN_Bissrog_s8':['BISSROG','BISHROG'],'V6TN_Bissrog_s11':['BISSROG','BISHROG'],'V6TN_Bissrog_s13':['BISSROG','BISHROG'],'V6TN_Bissrog_s14':['BISSROG','BISHROG'],'V6TN_Bissrog_s15':['BISSROG','BISHROG'],'V6TN_Bissrog_s16':['BISSROG','BISHROG'],'V6TN_Bissrog_s17':['BISSROG','BISHROG'],'V6TN_Bissrog_s18':['BISSROG','BISHROG'],'V6TN_Bissrog_s19':['BISSROG','BISHROG'],'V6TN_Bissrog_s21':['BISSROG','BISHROG'],'V6TN_Bissrog_s24':['BISSROG','BISHROG'],'V6TN_Bissrog_s27':['BISSROG','BISHROG']},
            


                }
                )
            }    

//CREATE VARIABLE AND DESIGNATE REPETITIONS OF STIMULI
                var Labeling = new MultipleLabelBlock({stimuli: stimuli,
                                    respKeys:  {'X':'S', 'M':'SH'},
                                    categories: ['S','SH'],
                                    reps: 1,
                                    namespace: 'Labeling'});

//CREATE NEW BLOCK AND ADD VARIABLE (WHICH CONTAINS STIMULI) TO THE BLOCK. DESIGNATE INSTRUCTIONS AND PREVIEW STATUS                                   
             e.addBlock(
                  {
                      block: Labeling,
                      instructions:'<h3>Section 1</h2><p>In this section, you will hear non-words and two spellings will appear on the screen. Using the keys designated for each spelling, choose which one you think matches what you hear. Listen carefully, but please answer as quickly and accurately as possible. You might hear the same sound several times.</p>',
                      onPreview: false,
                  }
                 );



                $("#continue").hide();
                e.nextBlock();
            }
          })
