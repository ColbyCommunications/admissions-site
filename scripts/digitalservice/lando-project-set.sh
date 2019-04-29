#!/usr/bin/env bash
#Go get our colors if we dont already have them
if [[ -z ${CENTRY+x} ]]; then
    DIR="${BASH_SOURCE%/*}"
    if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi

    #pull in our global vars
    . "${DIR}/globvars.sh"
fi

if [[ ! -z "$1" && "y" == "${1}" ]]; then
    SETPROJECT=$1
else
    printf "${CENTRY}Would you like me to attach this lando project to a platform project? [y\\N]: ${CRESET}"
    read SETPROJECT
fi

# We could potentially check `git remote -v` for the instance of a platform remote and only run if it isnt there

#set to case insensitive
shopt -s nocasematch
if [[ "Y" == "${SETPROJECT}" ]]; then
    PLATFORM=$(which platform)
    PROJECTNAMEPATTERN="\/([a-z0-9]{2}\-[^\ ]+)\.git"
    # let's get the git repos
    REMOTEREPO=$(git remote -v | head -n 1)
    #printf "REMOTE REPO LINE: ${REMOTEREPO}\n"
    if [[ $REMOTEREPO =~ $PROJECTNAMEPATTERN ]]; then
        DEFAULTPLATFORMTITLE="${BASH_REMATCH[1]}"
    fi
    printf "${CENTRY}Please enter the project name"

    if [[ ! -z "${DEFAULTPLATFORMTITLE}" ]]; then
        printf " (press enter for the default of ${CBOLD}${DEFAULTPLATFORMTITLE}${CENTRY})"
    fi

    printf ": ${CRESET}"
    read PLATFORMTITLE
    if [[ -z "${PLATFORMTITLE}" ]]; then
        PLATFORMTITLE="${DEFAULTPLATFORMTITLE}"
    fi

    # check to make sure they gave you something
    if [[ ! -z "${PLATFORMTITLE}" ]]; then
        #we couild allow them to enter the domain and if so, skip the Id lookup
        PLATFORMID=$(platform project:list --title="${PLATFORMTITLE}" --columns=ID --format=csv --no-header --pipe)
        if [[ ! -z "${PLATFORMID}" ]]; then
            #should we check to see if it worked?
            $PLATFORM p:set-remote "${PLATFORMID}"
        else
            printf "${CWARN}${PLATFORMTITLE} did not match any platform projects you have access to.${CRESET}\n"
        fi
    else
        printf "${CINFO}Uh, I can't look up the project if you don't give me something to look up. ${CRESET}\n"
    fi
fi
#return it back to case sensitive
shopt -u nocasematch