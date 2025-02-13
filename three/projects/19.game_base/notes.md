## Figure out a folder and class structure

> ### Camera renderer
> - FEATURE: camera zoom in and out

---

> ### ENEMY CLASS Enemy type to extend enemy and load model based on type ?
> - REFACTOR: class Enemy extends EnemyBase
> - REFACTOR: attack calculations to be moved to separate class

---

> ### IMPLEMENT: Animations class - handler for animations
> - needs more consistent models and names

---

> ### MOVE AI to separate class.
> - enemy would use AI, AI would use attacks. attack would use calculated damage stats.

---

> ### Attacks to be moved to separate class
>  // Move to separate class, could be used by all enemies / player,
>  // add extra calculations -> optionally, later.
>
>    // When enemy is dead, remove from scene
>    // Spawn another maybe

> check reset stats for enemies.

---

> ### game state
>    // Reset global states later.
>    // Timers?
>    // Scores?

---

> ### Health bar
>    could be a bar, and healthbar could extend the bar class?
