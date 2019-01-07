#!/usr/bin/env python
#
# Copyright (c) 2014, Andrew Watts and
#        the University of Rochester BCS Department
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# * Redistributions of source code must retain the above copyright notice, this
#   list of conditions and the following disclaimer.
#
# * Redistributions in binary form must reproduce the above copyright notice,
#   this list of conditions and the following disclaimer in the documentation
#   and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
# FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
# CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
# OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

from __future__ import print_function
import argparse
import pandas as pd
from boto.mturk.connection import MTurkConnection
from boto import config
from boto.mturk.price import Price

__author__ = 'Andrew Watts <awatts@bcs.rochester.edu>'

reason = "For completely the speech perception experiment. Nice job!"

parser = argparse.ArgumentParser(description='Approve work from Amazon Mechanical Turk')
parser.add_argument('-r', '--resultsfile', required=True, help='Filename for tab delimited CSV file')
parser.add_argument('-b', '--bonus', required=True, help='Amount for bonus')
parser.add_argument('-s', '--sandbox', action='store_true',
                    help='Run the command in the Mechanical Turk Sandbox (used for testing purposes)')
args = parser.parse_args()

if args.sandbox:
    if not config.has_section('MTurk'):
        config.add_section('MTurk')
    config.set('MTurk', 'sandbox', 'True')
    mturk_website = 'requestersandbox.mturk.com'

results = pd.read_csv(args.resultsfile, sep='\t')

mtc = MTurkConnection(is_secure=True)

for i, j in enumerate(list(results['assignmentid'])):
    if (results['Answer.passedCalibration'][i]) == "passed":
        print("Awarding bonus of {0} to {1}".format(args.bonus, results['workerid'][i]))
        mtc.grant_bonus(results['workerid'][i], results['assignmentid'][i], Price(args.bonus), reason)
