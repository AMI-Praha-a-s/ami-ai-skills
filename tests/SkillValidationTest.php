<?php

use Symfony\Component\Yaml\Yaml;

$skillsDir = __DIR__.'/../resources/boost/skills';

it('has a resources/boost/skills directory', function () use ($skillsDir) {
    expect(is_dir($skillsDir))->toBeTrue();
});

it('contains at least one skill', function () use ($skillsDir) {
    $dirs = array_filter(glob($skillsDir.'/*'), 'is_dir');
    expect($dirs)->not->toBeEmpty();
});

dataset('skills', function () use ($skillsDir) {
    $dirs = array_filter(glob($skillsDir.'/*'), 'is_dir');

    foreach ($dirs as $dir) {
        yield basename($dir) => [$dir];
    }
});

it('has a SKILL.md file', function (string $skillDir) {
    $hasSkillMd = file_exists($skillDir.'/SKILL.md');
    $hasSkillBlade = file_exists($skillDir.'/SKILL.blade.php');

    expect($hasSkillMd || $hasSkillBlade)->toBeTrue(
        'Skill directory '.basename($skillDir).' must contain SKILL.md or SKILL.blade.php'
    );
})->with('skills');

it('has valid YAML frontmatter with required fields', function (string $skillDir) {
    $file = file_exists($skillDir.'/SKILL.md')
        ? $skillDir.'/SKILL.md'
        : $skillDir.'/SKILL.blade.php';

    $content = file_get_contents($file);

    // Check frontmatter delimiters
    expect($content)->toStartWith('---');

    // Extract frontmatter
    preg_match('/^---\n(.+?)\n---/s', $content, $matches);
    expect($matches)->toHaveCount(2, 'Could not parse YAML frontmatter');

    $frontmatter = Yaml::parse($matches[1]);

    expect($frontmatter)->toBeArray()
        ->and($frontmatter)->toHaveKey('name')
        ->and($frontmatter)->toHaveKey('description')
        ->and($frontmatter['name'])->toBeString()->not->toBeEmpty()
        ->and($frontmatter['description'])->toBeString()->not->toBeEmpty();
})->with('skills');

it('has a name matching its directory name', function (string $skillDir) {
    $file = file_exists($skillDir.'/SKILL.md')
        ? $skillDir.'/SKILL.md'
        : $skillDir.'/SKILL.blade.php';

    $content = file_get_contents($file);

    preg_match('/^---\n(.+?)\n---/s', $content, $matches);
    $frontmatter = Yaml::parse($matches[1]);

    expect($frontmatter['name'])->toBe(basename($skillDir));
})->with('skills');

it('has markdown content after frontmatter', function (string $skillDir) {
    $file = file_exists($skillDir.'/SKILL.md')
        ? $skillDir.'/SKILL.md'
        : $skillDir.'/SKILL.blade.php';

    $content = file_get_contents($file);

    // Remove frontmatter
    $body = preg_replace('/^---\n.+?\n---\n*/s', '', $content);

    expect(trim($body))->not->toBeEmpty()
        ->and($body)->toContain('#'); // Should have at least one heading
})->with('skills');
