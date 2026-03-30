-- create_folder.applescript
-- 보안: 폴더 생성만 가능. delete 명령 없음.
-- 사용법: osascript create_folder.applescript "00_Personal" ["02_Study" "01_AI" ...]

on run argv
	if (count of argv) is 0 then
		return "ERROR: 폴더명을 입력해주세요"
	end if

	tell application "Notes"
		-- 최상위 폴더 찾거나 생성
		set currentFolder to missing value
		repeat with f in every folder
			if name of f is (item 1 of argv) and class of container of f is not folder then
				set currentFolder to f
				exit repeat
			end if
		end repeat
		if currentFolder is missing value then
			set currentFolder to make new folder with properties {name: item 1 of argv}
		end if

		-- 하위 폴더 순서대로 찾거나 생성
		repeat with i from 2 to count of argv
			set childFolder to missing value
			repeat with f in folders of currentFolder
				if name of f is (item i of argv) then
					set childFolder to f
					exit repeat
				end if
			end repeat
			if childFolder is missing value then
				set childFolder to make new folder with properties {name: item i of argv} at currentFolder
			end if
			set currentFolder to childFolder
		end repeat

		return "OK:" & name of currentFolder
	end tell
end run
