#!/bin/bash
# Create new chapter based on the content of the previous one
# Creates folder for new chapter
# Copies all files from previous
# First copies dotfiles (mainly because of .gitignore)
# Then everything else
# Finally deletes node_modules of previous one, reinstalls to avoid errors

chapterNumber=$1
previousChapterNumber=$(($chapterNumber - 1))
chapterFolder="chapter-$chapterNumber"
previousChapterFolder="chapter-$previousChapterNumber"

mkdir $chapterFolder;
cp "$previousChapterFolder"/.* "$chapterFolder";
cp -r "$previousChapterFolder"/* "$chapterFolder";
mv $chapterFolder
(cd $chapterFolder; rm -rf "node_modules"; cd ../)
(cd $chapterFolder; npm i; cd ../)
