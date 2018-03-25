// decide if 2 strings are anagrams or not

function anagramChecker(s1, s2){
	chars1 = s1.toCharArray();
	chars2 = s2.toCharArray();
	isAnagram = true;

	
	if (chars1.equals(chars2)){
		return true;
	}

	if (chars1.length != chars2.length){
		return false;
	}

	// using contains method
	for (int i =0; i<chars1.length; i++){
		if !(chars2.contains(chars1[i])){
			return false;
		}
	}

	// using sort
	if !(chars1.sort().equals(chars2.sort())){
		return false;
	}

	/*
	 * build custom sort fxn, and then check if
	 * they are equal along the way of the sort
	 */
TODO: 
	// build n² complexity

	return isAnagram;
}