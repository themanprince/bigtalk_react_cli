function makeComponent() {
	mkdir $1;
	declare indexFile;
	indexFile="${1}/${1}.js";
	touch "${indexFile}";
	echo 'import React, {Component} from "react";' > "$indexFile";
	touch "${1}/${1}.test.js";
	#next, scope css only if its not root
	if (($1=="Root"))
	then
		touch "${1}/${1}.css";
	else
		touch "${1}/${1}.module.css";
	fi
}

declare -a components=(Path Sep Fld Input Output Whole);

for component in ${components[@]}
do
	makeComponent "$component";	
done;