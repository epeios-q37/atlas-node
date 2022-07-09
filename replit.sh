#!/bin/bash

chr() {
  [ "$1" -lt 256 ] || return 1
  printf "\\$(printf '%03o' "$1")"
}

ord() {
  LC_CTYPE=C printf '%d' "'$1"
}

DEMOS=(Blank Hello Chatroom 15-puzzle Notes TodoMVC)

export DEMOS_AMOUNT=${#DEMOS[@]}

while :
do
  echo

  for i in "${!DEMOS[@]}"
  do
    printf "%s: %s\n" "$(chr $((97 + $i )))" "${DEMOS[$i]}"  
  done

  echo -n -e "\nChoose demonstration to launch ('a'…'$(chr $((96 + $DEMOS_AMOUNT)))'): "

  read DEMO

  export FILE=${DEMOS[$(($(ord $DEMO) - 97))]}/main.js

  npm list atlastk &>/dev/null || npm install atlastk

  [ -f examples/$FILE ] && node examples/$FILE
done
