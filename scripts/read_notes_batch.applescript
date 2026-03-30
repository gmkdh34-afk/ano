-- read_notes_batch.applescript
-- 보안: 읽기 전용. delete 명령 없음.
-- 사용법: osascript read_notes_batch.applescript <offset> <limit>
-- 예시:   osascript read_notes_batch.applescript 0 50   → 처음 50개
--         osascript read_notes_batch.applescript 50 50  → 51~100번째
-- 첫 줄에 TOTAL:<전체개수> 반환 → 다음 offset 계산에 활용

on run argv
	set offsetNum to (item 1 of argv) as integer
	set limitNum to (item 2 of argv) as integer

	tell application "Notes"
		set allNotes to every note
		set total to count of allNotes

		set output to "TOTAL:" & total & return

		set startIdx to offsetNum + 1
		set endIdx to offsetNum + limitNum
		if endIdx > total then set endIdx to total
		if startIdx > total then return output

		repeat with i from startIdx to endIdx
			set aNote to item i of allNotes
			set noteFolder to ""
			try
				set noteFolder to name of container of aNote
			end try
			set output to output & "ID:" & (id of aNote) & "|||TITLE:" & (name of aNote) & "|||FOLDER:" & noteFolder & "|||BODY:" & (plaintext of aNote) & return & "---NOTE_END---" & return
		end repeat
		return output
	end tell
end run
