-- Demonstration: How student-specific completion works

-- Scenario: We have 3 students and 2 assignments

-- Students:
-- student_001 (John)
-- student_002 (Mary) 
-- student_003 (Bob)

-- Assignments:
-- assignment_id: 1 (Math Homework)
-- assignment_id: 2 (Science Project)

-- Initially, no one has completed anything:
-- student_assignment_completions table is empty

-- Step 1: John (student_001) ticks assignment 1
INSERT INTO student_assignment_completions (student_id, assignment_id) 
VALUES ('student_001', 1);

-- Step 2: Mary (student_002) ticks assignment 1 and assignment 2
INSERT INTO student_assignment_completions (student_id, assignment_id) 
VALUES ('student_002', 1), ('student_002', 2);

-- Step 3: Bob (student_003) ticks assignment 2
INSERT INTO student_assignment_completions (student_id, assignment_id) 
VALUES ('student_003', 2);

-- Now when each student loads their dashboard:

-- John's view (student_001):
-- Assignment 1: ✓ COMPLETED (he ticked it)
-- Assignment 2: ❌ NOT COMPLETED (he hasn't ticked it)

-- Mary's view (student_002):
-- Assignment 1: ✓ COMPLETED (she ticked it)
-- Assignment 2: ✓ COMPLETED (she ticked it)

-- Bob's view (student_003):
-- Assignment 1: ❌ NOT COMPLETED (he hasn't ticked it)
-- Assignment 2: ✓ COMPLETED (he ticked it)

-- The query for each student's view:
-- For John (student_001):
SELECT a.*, 
       CASE WHEN sac.id IS NOT NULL THEN true ELSE false END as completed_by_student
FROM assignments a
LEFT JOIN student_assignment_completions sac 
  ON a.id = sac.assignment_id 
  AND sac.student_id = 'student_001';

-- For Mary (student_002):
SELECT a.*, 
       CASE WHEN sac.id IS NOT NULL THEN true ELSE false END as completed_by_student
FROM assignments a
LEFT JOIN student_assignment_completions sac 
  ON a.id = sac.assignment_id 
  AND sac.student_id = 'student_002';

-- Each student sees only their own completion status!
